import React, { useState } from 'react';

const MenuForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    specialOffer: false,
    discount: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : name === 'price' || name === 'discount' ? parseFloat(value) : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price > 0) {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('price', String(formData.price));
      submitData.append('specialOffer', formData.specialOffer ? 'true' : 'false');
      submitData.append('discount', String(formData.discount));
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      onSubmit(submitData);
      setFormData({
        name: '',
        price: '',
        specialOffer: false,
        discount: '',
        image: null,
      });
    } else {
      alert('Please fill all fields correctly');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <div className="row">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Item Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3 mb-2">
          <input
            type="number"
            className="form-control"
            placeholder="Price"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-3 mb-2 d-flex align-items-center">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="specialOfferSwitch"
              name="specialOffer"
              checked={formData.specialOffer}
              onChange={handleChange}
            />
            <label className="form-check-label ms-2" htmlFor="specialOfferSwitch">
              Special Offer
            </label>
          </div>
        </div>
        <div className="col-md-2 mb-2">
          <button type="submit" className="btn btn-success w-100">
            Add
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col-md-4 mb-2">
          <input
            type="file"
            className="form-control"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      </div>
      {formData.specialOffer && (
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Discount (e.g. 10% off)"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </form>
  );
};

export default MenuForm;
