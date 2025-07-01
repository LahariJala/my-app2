import React, { useState, useEffect } from "react";

const FarmMarket = () => {
  const [productList, setProductList] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "", price: "", photo: "" });
  const [contactForm, setContactForm] = useState({ name: "", message: "" });
  const [cart, setCart] = useState([]);
  const [viewMode, setViewMode] = useState("customer"); // 'customer' or 'producer'

  useEffect(() => {
    const saved = localStorage.getItem("farmProducts");
    if (saved) setProductList(JSON.parse(saved));

    const savedCart = localStorage.getItem("farmCart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem("farmProducts", JSON.stringify(productList));
  }, [productList]);

  useEffect(() => {
    localStorage.setItem("farmCart", JSON.stringify(cart));
  }, [cart]);

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

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert(`Message sent from ${contactForm.name}: ${contactForm.message}`);
    setContactForm({ name: "", message: "" });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🌾 Farm-to-Market</h1>

      {/* Toggle view */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setViewMode("customer")}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            backgroundColor: viewMode === "customer" ? "#4CAF50" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          👩‍🌾 Customer View
        </button>
        <button
          onClick={() => setViewMode("producer")}
          style={{
            padding: "8px 16px",
            backgroundColor: viewMode === "producer" ? "#673AB7" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          🚜 Producer View
        </button>
      </div>

      {/* Producer Form */}
      {viewMode === "producer" && (
        <>
          <h3>📤 Post Your Farm Product</h3>
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ padding: "6px", marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Quantity (kg)"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              style={{ padding: "6px", marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Price (₹/kg)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={{ padding: "6px", marginRight: "10px" }}
            />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            <button type="submit" style={{
              marginTop: "10px",
              padding: "6px 16px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}>
              📤 Post Product
            </button>
          </form>
        </>
      )}

      {/* Product Listing for Customers */}
      {viewMode === "customer" && (
        <>
          <h3>🛍️ Available Products</h3>
          {productList.length === 0 && <p>No products listed yet.</p>}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {productList.map((prod, index) => (
              <li key={index} style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px"
              }}>
                {prod.photo && (
                  <img
                    src={prod.photo}
                    alt="product"
                    style={{ maxWidth: "120px", display: "block", marginBottom: "10px" }}
                  />
                )}
                <strong>{prod.name}</strong><br />
                {prod.quantity} kg @ ₹{prod.price}/kg
                <br />
                <button onClick={() => handleAddToCart(prod)} style={{
                  marginTop: "8px",
                  background: "#FF9800",
                  color: "white",
                  padding: "6px 10px",
                  border: "none",
                  borderRadius: "4px"
                }}>
                  🛒 Add to Cart
                </button>
              </li>
            ))}
          </ul>

          {/* Cart Display */}
          <h3>🧾 Your Cart</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {cart.map((item, i) => (
                <li key={i} style={{ marginBottom: "6px" }}>
                  ✅ {item.name} - {item.quantity}kg @ ₹{item.price}/kg
                </li>
              ))}
            </ul>
          )}

          {/* Contact Buyer Form */}
          <h3>📩 Contact the Producer</h3>
          <form onSubmit={handleContactSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={contactForm.name}
              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              style={{ padding: "6px", marginBottom: "6px", display: "block", width: "100%" }}
            />
            <textarea
              placeholder="Your message"
              value={contactForm.message}
              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              style={{ padding: "6px", marginBottom: "6px", display: "block", width: "100%" }}
            />
            <button type="submit" style={{
              padding: "6px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}>
              📩 Send Request
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default FarmMarket;
