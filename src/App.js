import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('John Doe');
  const [bio, setBio] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('(123) 456-7890');
  const [website, setWebsite] = useState('example.com');
  const [mainPhoto, setMainPhoto] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);

  const handleMainPhotoChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setMainPhoto(URL.createObjectURL(file));
    }
  };

  const handleGalleryPhotosChange = (event) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));
      setGalleryPhotos(prevPhotos => [...prevPhotos, ...newImageUrls]); // Append new images
    }
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (mainPhoto) {
        URL.revokeObjectURL(mainPhoto);
      }
      galleryPhotos.forEach(photoUrl => URL.revokeObjectURL(photoUrl));
    };
  }, [mainPhoto, galleryPhotos]);

  return (
    <div className="profile-container">
      <header className="profile-header">
        {mainPhoto ? (
          <img src={mainPhoto} alt="Profile" className="profile-photo-placeholder main-profile-img" />
        ) : (
          <div className="profile-photo-placeholder">Photo</div>
        )}
        <div>
          <h1>{name}</h1>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
        </div>
      </header>

      <section className="profile-edit-forms">
        <h2>Edit Your Profile</h2>
        
        <label htmlFor="main-photo-upload">Main Profile Photo:</label>
        <input type="file" id="main-photo-upload" accept="image/*" onChange={handleMainPhotoChange} />

        <label htmlFor="bio">About Me:</label>
        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
        
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" />
        
        <label htmlFor="phone">Phone:</label>
        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your Phone Number" />
        
        <label htmlFor="website">Website:</label>
        <input type="url" id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Your Website URL" />

        <label htmlFor="gallery-upload">Gallery Photos:</label>
        <input type="file" id="gallery-upload" accept="image/*" multiple onChange={handleGalleryPhotosChange} />
      </section>

      <section className="profile-bio">
        <h2>About Me</h2>
        <p>{bio}</p>
      </section>
      <section className="profile-contact">
        <h2>Contact Details</h2>
        <ul>
          <li>Email: {email}</li>
          <li>Phone: {phone}</li>
          <li>Website: <a href={website} target="_blank" rel="noopener noreferrer">{website}</a></li>
        </ul>
      </section>
      <section className="profile-photos">
        <h2>My Photos</h2>
        <div className="photo-gallery">
          {galleryPhotos.length > 0 ? (
            galleryPhotos.map((photoUrl, index) => (
              <img key={index} src={photoUrl} alt={`Gallery photo ${index + 1}`} className="profile-photo-placeholder gallery-img" />
            ))
          ) : (
            <>
              <div className="profile-photo-placeholder">Photo</div>
              <div className="profile-photo-placeholder">Photo</div>
              <div className="profile-photo-placeholder">Photo</div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
