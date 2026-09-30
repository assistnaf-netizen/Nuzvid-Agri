import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import './Blogs.css';
import { blogsContent } from '../utils/blogData';

const BlogDetail = () => {
  const { slug } = useParams();
  
  const blog = blogsContent.find(b => b.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!blog) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '100px', minHeight: '60vh' }}>
        <h2>Blog post not found</h2>
        <Link to="/blogs" className="btn-primary mt-4 d-inline-block">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page" style={{ backgroundColor: '#FAF9F6' }}>
      <SEO title={blog.title} description={blog.description} />
      
      <div className="blog-detail-header text-center py-5">
        <div className="container mt-4">
          <div className="breadcrumb justify-content-center mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
            <Link to="/" style={{ color: '#666', textDecoration: 'none' }}><ArrowLeft size={14} style={{ marginRight: '4px', position: 'relative', top: '-1px' }}/> Home</Link> <ChevronRight size={14} /> 
            <Link to="/blogs" style={{ color: '#666', textDecoration: 'none' }}>Blogs</Link> <ChevronRight size={14} />
            <span style={{ color: '#8B4513' }}>{blog.title}</span>
          </div>
          
          <h1 className="blog-detail-title mb-4" style={{ fontFamily: 'var(--font-heading)', color: '#333', fontSize: '2.5rem', fontWeight: 'bold', maxWidth: '900px', margin: '0 auto', lineHeight: '1.3' }}>{blog.title}</h1>
          
          <div className="blog-detail-meta d-flex justify-content-center align-items-center gap-3 mt-3 mb-5" style={{ color: '#555' }}>
            <span className="d-flex align-items-center gap-2"><Calendar size={16} color="#8B4513" /> {blog.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>|</span>
            <span className="blog-category-badge" style={{ color: '#8B4513', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>{blog.category}</span>
          </div>
          
          <div className="blog-featured-image-container mx-auto" style={{ maxWidth: '1000px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
            <img src={blog.image} alt={blog.title} className="img-fluid w-100" style={{ objectFit: 'cover', maxHeight: '500px' }} />
          </div>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="blog-content-wrapper" style={{ 
              fontSize: '1.15rem', 
              lineHeight: '1.9', 
              color: '#333',
              fontFamily: 'var(--font-body)',
              padding: '20px 0 40px'
            }}>
              <p className="lead mb-4" style={{ fontSize: '1.25rem', color: '#555', fontStyle: 'italic', borderLeft: '4px solid #8B4513', paddingLeft: '20px' }}>
                {blog.description}
              </p>
              {blog.content}
            </div>
            
            <div className="text-center mt-5 pt-5 border-top" style={{ borderColor: '#eee' }}>
              <Link to="/blogs" className="btn" style={{ 
                backgroundColor: '#8B4513', 
                color: 'white', 
                padding: '12px 30px', 
                borderRadius: '30px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'background 0.3s ease'
              }}>Back to All Articles</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
