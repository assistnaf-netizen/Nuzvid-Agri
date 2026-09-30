import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { blogsContent } from '../utils/blogData';
import './Blogs.css';

const Blogs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="blogs-page-wrapper">
      <SEO title="News & Stories - Nuzvid Agri Farms" description="Discover our roots, traditional farming practices, and the wholesome goodness behind every Nuzvid Agri Farms product." />
      <section className="blogs-hero">
        <h1>News & Stories</h1>
        <p>Discover our roots, traditional farming practices, and the wholesome goodness behind every Nuzvid Agri Farms product.</p>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>Blogs</span>
        </div>
      </section>

      <div className="blogs-grid">
        {blogsContent.map((blog, index) => (
          <div key={index} className="blog-card">
            <div className="blog-image-placeholder">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 11h10v2H7zm0-4h10v2H7zm0 8h7v2H7z"></path></svg>
            </div>
            <div className="blog-card-content">
              <div className="blog-date">{blog.date}</div>
              <h2 className="blog-title">{blog.title}</h2>
              <p className="blog-description">{blog.description}</p>
              <Link to={`/blogs/${blog.slug}`} className="blog-read-more">
                Read Full Story
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
