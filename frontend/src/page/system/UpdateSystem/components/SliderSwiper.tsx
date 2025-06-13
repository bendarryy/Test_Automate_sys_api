import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { AiOutlinePicture } from 'react-icons/ai';
import 'swiper/';
import 'swiper/css/navigation';
import { SliderImage } from '../types/publicProfileTypes';

interface SliderSwiperProps {
  images: SliderImage[];
}

const SliderSwiper: React.FC<SliderSwiperProps> = ({ images }) => (
  <Swiper
    spaceBetween={16}
    slidesPerView={1}
    style={{ width: '100%', height: 220 }}
    pagination={{ clickable: true }}
    navigation
    modules={[Navigation]}
  >
    {images.map((img, idx) => (
      <SwiperSlide key={img.id || img.image || idx}>
        <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #eee', background: '#fafafa' }}>
          {img.image ? (
            <img
              src={img.image}
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
);

export default SliderSwiper;
