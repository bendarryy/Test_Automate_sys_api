import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Avatar,
  Alert,
  Switch,
  Divider,
  Row,
  Col,
  Upload,
  Modal,
  Popover,
} from 'antd';
import { AiOutlinePicture } from 'react-icons/ai';
import { useApi } from '../../../shared/hooks/useApi';
import { z } from 'zod';
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/bundle';

// Zod schema for validation
const socialLinksSchema = z.object({
  facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  youtube: z.string().url('Invalid URL').optional().or(z.literal('')),
  tiktok: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const profileSchema = z.object({
  description: z.string().optional(),
  is_public: z.boolean(),
  public_title: z.string().max(200, 'Max 200 characters').optional().or(z.literal('')),
  public_description: z.string().optional(),
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Invalid hex color'),
  secondary_color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Invalid hex color'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  whatsapp_number: z.string().regex(/^(\+\d{8,15})$/, 'Format: +9665XXXXXXX').optional().or(z.literal('')),
  social_links: socialLinksSchema,
});

type ProfileForm = z.infer<typeof profileSchema> & {
  logo?: File | null;
  logo_url?: string;
  sliderImages?: Array<{
    id: number;
    image_url: string;
    caption: string;
    is_active: boolean;
  }>;
};

const initialForm: ProfileForm = {
  description: '',
  is_public: false,
  public_title: '',
  public_description: '',
  primary_color: '#1976d2',
  secondary_color: '#fff',
  email: '',
  whatsapp_number: '',
  social_links: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
  },
  logo: null,
  logo_url: '',
  sliderImages: [],
};

const EditSystemPublicProfile: React.FC = () => {
    const [systemId]= useSelectedSystemId();
  const { data, loading, error, callApi } = useApi<any>();
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(undefined);
  const [sliderImage, setSliderImage] = useState<File | null>(null);
  const [sliderCaption, setSliderCaption] = useState('');
  const [sliderActive, setSliderActive] = useState(true);
  const [sliderUploading, setSliderUploading] = useState(false);
  const [sliderError, setSliderError] = useState('');
  const [showSliderForm, setShowSliderForm] = useState(false);

  // Fetch system public profile
  useEffect(() => {
      callApi('get', `core/systems/${systemId}/public-profile/`).then((res) => {
        if (res) {
          setForm((prev) => ({
            ...prev,
            ...res,
            logo: null, // نتركه null حتى يرفع المستخدم صورة جديدة
            logo_url: res.logo || '', // استخدم logo من الـ API
            sliderImages: res.slider_images || [],
            social_links: {
              ...initialForm.social_links,
              ...res.social_links,
            },
          }));
          setLogoPreview(res.logo || '');
        }
      });
    
    // eslint-disable-next-line
  }, [systemId]);

  // جلب صور السلايدر من endpoint منفصل
  useEffect(() => {
    if (systemId) {
      callApi('get', `/core/systems/${systemId}/slider-images/`).then((res) => {
        if (Array.isArray(res)) {
          setForm((prev) => ({ ...prev, sliderImages: res }));
        }
      });
    }
    // eslint-disable-next-line
  }, [systemId]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (name.startsWith('social_links.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [key]: value,
        },
      }));
    } else if (type === 'checkbox' && 'checked' in e.target) {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'logo') {
        setForm((prev) => ({ ...prev, logo: files[0] }));
        setLogoPreview(URL.createObjectURL(files[0]));
      } else if (name === 'sliderImage') {
        setSliderImage(files[0]);
      }
    }
  };

  // دالة handleSliderFileChange للتعامل مع رفع صورة السلايدر
  const handleSliderFileChange = (info: any) => {
    let file = null;
    if (info.file && info.file.originFileObj) {
      file = info.file.originFileObj;
    } else if (info.fileList && info.fileList.length > 0 && info.fileList[0].originFileObj) {
      file = info.fileList[0].originFileObj;
    }
    if (file) {
      setSliderImage(file);
    } else {
      setSliderImage(null);
    }
  };

  // Validate form
  const validate = () => {
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  // Handle PATCH submit for public profile
  const handleSubmit = async () => {
    if (!validate() || !systemId) {
      console.log('Validation failed or id missing', { form, systemId });
      setFormErrors((prev) => ({ ...prev, global: 'يرجى التأكد من صحة البيانات أو وجود رقم النظام.' }));
      return;
    }
    setSubmitting(true);
    try {
      // Only send non-empty/changed fields
      const payload: any = {};
      Object.entries(form).forEach(([key, value]) => {
        if (
          key !== 'logo' &&
          key !== 'logo_url' &&
          key !== 'sliderImages' &&
          value !== undefined &&
          value !== null &&
          (typeof value !== 'string' || value.trim() !== '')
        ) {
          payload[key] = value;
        }
      });
      // Social links: only send non-empty
      payload.social_links = Object.fromEntries(
        Object.entries(form.social_links).filter(([, v]) => v && v.trim() !== '')
      );
      console.log('Submitting payload:', payload);
      await callApi('patch', `/core/systems/${systemId}/public-profile/`, payload);
      setSuccess(true);
    } catch (err) {
      setFormErrors((prev) => ({ ...prev, global: 'حدث خطأ أثناء الحفظ. حاول مرة أخرى.' }));
      console.error('API error:', err);
      // error handled by useApi
    } finally {
      setSubmitting(false);
    }
  };

  // Handle logo upload (PUT)
  const handleLogoUpload = async () => {
    if (!form.logo || !systemId) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(form.logo.type)) {
      setFormErrors((prev) => ({ ...prev, logo: 'Logo must be PNG, JPEG, or WebP.' }));
      return;
    }
    const formData = new FormData();
    formData.append('logo', form.logo);
    setSubmitting(true);
    try {
      await callApi('put', `/core/systems/${systemId}/logo/`, formData, true);
      setSuccess(true);
      setForm((prev) => ({ ...prev, logo: null }));
    } catch (err) {
      // error handled by useApi
    } finally {
      setSubmitting(false);
    }
  };

  // Handle slider image upload (POST)
  const handleSliderUpload = async () => {
    if (!sliderImage || !systemId) return;
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(sliderImage.type)) {
      setSliderError('Image must be PNG, JPEG, or WebP.');
      return;
    }
    if (sliderCaption.length > 200) {
      setSliderError('Caption max 200 characters.');
      return;
    }
    setSliderUploading(true);
    setSliderError('');
    const formData = new FormData();
    formData.append('image', sliderImage);
    formData.append('caption', sliderCaption);
    formData.append('is_active', String(sliderActive));
    try {
      await callApi('post', `/core/systems/${systemId}/slider-images/`, formData, true);
      setSliderImage(null);
      setSliderCaption('');
      setSliderActive(true);
      setSuccess(true);
      // Refresh slider images
      callApi('get', `/core/systems/${systemId}/public-profile/`).then((res) => {
        if (res) setForm((prev) => ({ ...prev, sliderImages: res.slider_images || [] }));
      });
    } catch (err) {
      setSliderError('Failed to upload image.');
    } finally {
      setSliderUploading(false);
    }
  };

  // Tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTab(newValue);

  // Color picker
  const handleColorChange = (name: 'primary_color' | 'secondary_color', value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Color Picker Helper
  const ColorPicker = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => {
    const [open, setOpen] = useState(false);
    const [tempColor, setTempColor] = useState(value);
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        content={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={tempColor}
              onChange={e => setTempColor(e.target.value)}
              style={{ width: 60, height: 40, border: 'none', background: 'none', cursor: 'pointer' }}
              autoFocus
            />
            <Button size="small" type="primary" onClick={() => { onChange(tempColor); setOpen(false); }}>OK</Button>
          </div>
        }
        trigger="click"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: value,
            border: '2px solid #ccc',
            cursor: 'pointer',
            display: 'inline-block',
            marginLeft: 8,
            verticalAlign: 'middle',
          }}
          title={value}
          onClick={e => { e.stopPropagation(); setTempColor(value); setOpen(true); }}
        />
      </Popover>
    );
  };

  // Preview section
  const PreviewSection = () => (
    <div style={{ padding: 24, borderRadius: 8, background: form.primary_color, color: form.secondary_color, minHeight: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        {/* شعار النظام في PreviewSection */}
        <Avatar
          src={logoPreview && logoPreview !== '' ? logoPreview : undefined}
          size={64}
          style={{ backgroundColor: 'primary.light', width: 64, height: 64, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          icon={(!logoPreview || logoPreview === '') && <AiOutlinePicture size={32} color="#bbb" />}
        />
        <div style={{ marginLeft: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{form.public_title}</div>
          <div style={{ fontSize: 14 }}>{form.public_description}</div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>{form.description}</div>
      <div style={{ marginTop: 16, fontSize: 14 }}>Email: {form.email}</div>
      <div style={{ fontSize: 14 }}>WhatsApp: {form.whatsapp_number}</div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        {Object.entries(form.social_links).map(([key, value]) => value && (
          <a key={key} href={value} target="_blank" rel="noopener noreferrer" style={{ color: form.secondary_color, marginRight: 8 }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <Row gutter={16} style={{ minHeight: '100vh', width: '100%', padding: 32, background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
      {/* General Information أكبر عرض */}
      <Col xs={24} md={16} lg={16}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 20, marginBottom: 16 }}>
          {/* General Information section */}
          <h2 style={{ color: '#1677ff', marginBottom: 16 }}>General Information</h2>
          <Form onFinish={handleSubmit}>
              <Form.Item label="Publicly visible to customers" valuePropName="checked">
                <Switch checked={form.is_public} onChange={(checked) => setForm((prev) => ({ ...prev, is_public: checked }))} />
              </Form.Item>
              <Form.Item
                label="Public Title"
                name="public_title"
                rules={[{ max: 200, message: 'Max 200 characters' }]}
                style={{ marginBottom: 16 }}
                extra="This will be shown to customers on your public page."
              >
                <Input name="public_title" value={form.public_title} onChange={handleChange} />
              </Form.Item>
              <Form.Item
                label="Public Description"
                name="public_description"
                style={{ marginBottom: 16 }}
                extra="Describe your system for customers."
              >
                <Input.TextArea name="public_description" value={form.public_description} onChange={handleChange} rows={2} />
              </Form.Item>
              <Form.Item
                label="General Description"
                name="description"
                style={{ marginBottom: 16 }}
                extra="Internal description for your team."
              >
                <Input.TextArea name="description" value={form.description} onChange={handleChange} rows={2} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Primary Color" name="primary_color" style={{ marginBottom: 16 }}>
                    <Input
                      name="primary_color"
                      value={form.primary_color}
                      onChange={(e) => handleColorChange('primary_color', e.target.value)}
                      suffix={<ColorPicker value={form.primary_color} onChange={color => handleColorChange('primary_color', color)} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Secondary Color" name="secondary_color" style={{ marginBottom: 16 }}>
                    <Input
                      name="secondary_color"
                      value={form.secondary_color}
                      onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                      suffix={<ColorPicker value={form.secondary_color} onChange={color => handleColorChange('secondary_color', color)} />}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="Email"
                name="email"
                style={{ marginBottom: 16 }}
              >
                <Input name="email" value={form.email} onChange={handleChange} />
              </Form.Item>
              <Form.Item
                label="WhatsApp Number"
                name="whatsapp_number"
                style={{ marginBottom: 16 }}
              >
                <Input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} />
              </Form.Item>
              <Divider style={{ margin: '16px 0' }}>Social Links</Divider>
              <Row gutter={16}>
                {Object.keys(initialForm.social_links).map((key) => (
                  <Col span={12} key={key}>
                    <Form.Item
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      name={`social_links.${key}`}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        name={`social_links.${key}`}
                        value={form.social_links[key as keyof typeof initialForm.social_links] || ''}
                        onChange={handleChange}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              {formErrors.global && <Alert message={formErrors.global} type="error" style={{ marginBottom: 16 }} />}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  style={{ width: '100%', borderRadius: 8, fontWeight: 600 }}
                >
                  Save Changes
                </Button>
              </Form.Item>
              {error && <Alert message={error} type="error" />}
            </Form>
        </div>
      </Col>
      {/* Media & Preview في العمود الجانبي */}
      <Col xs={24} md={8} lg={8}>
        <Row gutter={[0, 12]}>
          {/* Preview on top */}
          <Col span={24}>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 20, marginBottom: 12 }}>
              {/* Preview section */}
              <h2 style={{ color: '#1677ff', marginBottom: 16 }}>Preview</h2>
              <PreviewSection />
            </div>
          </Col>
          {/* Media below */}
          <Col span={24}>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #eee', padding: 20 }}>
              {/* Media section */}
              <h2 style={{ color: '#1677ff', marginBottom: 16 }}>Media</h2>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, marginBottom: 8 }}>Logo</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={logoPreview} size={64} style={{ backgroundColor: 'primary.light' }} />
                  <Button
                    type="primary"
                    style={{ marginLeft: 16 }}
                    icon={<AiOutlinePicture />}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/png,image/jpeg,image/webp';
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        const files = target.files;
                        if (files && files[0]) {
                          setForm((prev) => ({ ...prev, logo: files[0] }));
                          setLogoPreview(URL.createObjectURL(files[0]));
                        }
                      };
                      input.click();
                    }}
                  >
                    Upload Logo
                  </Button>
                  <Button
                    type="default"
                    style={{ marginLeft: 8 }}
                    disabled={!form.logo || submitting}
                    onClick={handleLogoUpload}
                  >
                    Save Logo
                  </Button>
                </div>
                {formErrors.logo && <Alert message={formErrors.logo} type="error" style={{ marginTop: 8 }} />}
                <div style={{ fontSize: 12, color: 'text.secondary', marginTop: 4 }}>Recommended: square, PNG/JPEG/WebP, 500x500px</div>
              </div>
              <Divider style={{ margin: '16px 0' }}>Slider Images</Divider>
              <Button type="primary" onClick={() => setShowSliderForm(true)} style={{ marginBottom: 16 }}>
                Add New Slide
              </Button>
              <Modal
                title="Add New Slider Image"
                open={showSliderForm}
                onCancel={() => setShowSliderForm(false)}
                footer={null}
                destroyOnHidden
              >
                <Form layout="vertical" style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 0, boxShadow: '0 1px 4px #eee', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Form.Item label="Image">
                    <Upload
                      beforeUpload={() => false}
                      showUploadList={false}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleSliderFileChange}
                    >
                      <Button icon={<AiOutlinePicture />}>Choose Image</Button>
                    </Upload>
                    {sliderImage ? (
                      <div style={{ marginTop: 8, border: '2px solid #52c41a', borderRadius: 8, padding: 4, display: 'inline-block' }}>
                        <img
                          src={URL.createObjectURL(sliderImage)}
                          alt="Selected Preview"
                          style={{ width: 200, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                        />
                        <div style={{ color: '#52c41a', fontWeight: 500, marginTop: 4 }}>Image selected</div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, color: '#bbb', fontSize: 13 }}>No image selected</div>
                    )}
                  </Form.Item>
                  <Form.Item label="Caption (optional)">
                    <Input value={sliderCaption} onChange={e => setSliderCaption(e.target.value)} maxLength={200} />
                  </Form.Item>
                  <Form.Item label="Active">
                    <Switch checked={sliderActive} onChange={setSliderActive} />
                  </Form.Item>
                  <Button
                    type="primary"
                    icon={<AiOutlinePicture />}
                    disabled={sliderUploading}
                    loading={sliderUploading}
                    onClick={async () => { await handleSliderUpload(); setShowSliderForm(false); }}
                    block
                  >
                    Upload Image
                  </Button>
                  {sliderError && <Alert message={sliderError} type="error" showIcon style={{ marginTop: 8 }} />}
                </Form>
              </Modal>
              {/* Slider Images List */}
              <Divider orientation="left" style={{ margin: '16px 0' }}>Current Slider Images</Divider>
              {form.sliderImages && form.sliderImages.length > 0 ? (
                <Swiper
                  spaceBetween={16}
                  slidesPerView={1}
                  style={{ width: '100%', height: 220 }}
                  pagination={{ clickable: true }}
                  navigation
                  modules={[Navigation]}
                >
                  {form.sliderImages.map((img, idx) => (
                    <SwiperSlide key={img.id}>
                      <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #eee', background: '#fafafa' }}>
                        {img.image_url ? (
                          <img
                            src={img.image_url}
                            alt={img.caption}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image'; }}
                          />
                        ) : (
                          <AiOutlinePicture size={64} color="#bbb" style={{ margin: '48px auto', display: 'block' }} />
                        )}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          background: 'rgba(0,0,0,0.45)',
                          color: '#fff',
                          padding: '12px 16px',
                          fontWeight: 600,
                          fontSize: 18,
                          textShadow: '0 2px 8px #000',
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          zIndex: 2,
                          boxSizing: 'border-box',
                        }}>
                          {img.caption || <span style={{ color: '#eee' }}>No caption</span>}
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 16,
                          color: img.is_active ? 'limegreen' : 'red',
                          fontWeight: 500,
                          fontSize: 13,
                          background: 'rgba(255,255,255,0.7)',
                          borderRadius: 6,
                          padding: '2px 10px',
                          zIndex: 2,
                        }}>
                          {img.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <span style={{ color: '#bbb' }}>No slider images uploaded.</span>
              )}
            </div>
          </Col>
        </Row>
      </Col>
      {success && (
        <Alert
          message="Profile updated successfully!"
          type="success"
          showIcon
          closable
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, width: 300 }}
          onClose={() => setSuccess(false)}
        />
      )}
    </Row>
  );
};

export default EditSystemPublicProfile;
