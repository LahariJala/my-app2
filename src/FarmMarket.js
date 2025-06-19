// src/FarmMarket.js
import React, { useState, useEffect } from "react";

const FarmMarket = () => {
  const [productList, setProductList] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", price: "", photo: "" });
  const [contactForm, setContactForm] = useState({ name: "", message: "" });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("farmProducts");
    if (saved) setProductList(JSON.parse(saved));
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem("farmProducts", JSON.stringify(productList));
  }, [productList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.quantity || !form.price) return;

    setProductList([...productList, form]);
    setForm({ name: "", quantity: "", price: "", photo: "" });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm({ ...form, photo: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Message sent from ${contactForm.name}: ${contactForm.message}`);
    setContactForm({ name: "", message: "" });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🛒 Sell Your Farm Products</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity (kg)"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price per kg (₹)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        <button type="submit">📤 Post Product</button>
      </form>

      <h3>🧺 Products Listed</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {productList.map((prod, index) => (
          <li key={index} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px"
          }}>
            {prod.photo && (
              <img src={prod.photo} alt="product" style={{ maxWidth: "150px", display: "block", marginBottom: "10px" }} />
            )}
            <strong>{prod.name}</strong> – {prod.quantity}kg @ ₹{prod.price}/kg
          </li>
        ))}
      </ul>

      <h3>🧾 Buyer Contact Form</h3>
      <form onSubmit={handleContactSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={contactForm.name}
          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
        />
        <textarea
          placeholder="Your message or request"
          value={contactForm.message}
          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
        />
        <button type="submit">📩 Send Request</button>
      </form>
    </div>
  );
};

export default FarmMarket;
