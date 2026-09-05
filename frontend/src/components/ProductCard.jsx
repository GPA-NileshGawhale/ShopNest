import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">₹{product.price}</p>
        <p className="product-rating">
          {'★'.repeat(Math.round(product.ratings || 0))}
          {'☆'.repeat(5 - Math.round(product.ratings || 0))}
          <span> {Number(product.ratings || 0).toFixed(1)} ({product.numReviews || 0} reviews)</span>
        </p>
        <Link to={`/product/${product._id}`} className="btn">View Details</Link>
      </div>
    </div>
  );
};

export default ProductCard;