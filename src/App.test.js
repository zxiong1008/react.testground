import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mocking URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(file => `mock-object-url:${file.name}`);
global.URL.revokeObjectURL = jest.fn();

describe('App Component - Profile Customization', () => {
  beforeEach(() => {
    render(<App />);
    // Clear mocks before each test for URL methods
    global.URL.createObjectURL.mockClear();
    global.URL.revokeObjectURL.mockClear();
  });

  test('updates and displays the name correctly', () => {
    const nameInput = screen.getByPlaceholderText('Your Name');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    // Name is displayed in an h1
    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument();
  });

  test('updates and displays the bio correctly', () => {
    const bioTextarea = screen.getByLabelText('About Me:'); // Using label text
    fireEvent.change(bioTextarea, { target: { value: 'A passionate developer.' } });
    // Bio is displayed in a p tag within a section titled "About Me"
    const bioSection = screen.getByRole('region', { name: 'About Me' });
    expect(bioSection).toHaveTextContent('A passionate developer.');
  });

  test('updates and displays email correctly', () => {
    const emailInput = screen.getByPlaceholderText('Your Email');
    fireEvent.change(emailInput, { target: { value: 'jane.doe@newexample.com' } });
    // Email is displayed in a list item
    expect(screen.getByText(`Email: jane.doe@newexample.com`)).toBeInTheDocument();
  });

  test('updates and displays phone correctly', () => {
    const phoneInput = screen.getByPlaceholderText('Your Phone Number');
    fireEvent.change(phoneInput, { target: { value: '(987) 654-3210' } });
    expect(screen.getByText(`Phone: (987) 654-3210`)).toBeInTheDocument();
  });

  test('updates and displays website correctly and updates link href', () => {
    const websiteInput = screen.getByPlaceholderText('Your Website URL');
    fireEvent.change(websiteInput, { target: { value: 'https://newexample.com' } });
    const websiteLink = screen.getByRole('link', { name: 'https://newexample.com' });
    expect(websiteLink).toBeInTheDocument();
    expect(websiteLink).toHaveAttribute('href', 'https://newexample.com');
  });
});

describe('App Component - Photo Uploads', () => {
  beforeEach(() => {
    render(<App />);
    global.URL.createObjectURL.mockClear();
    global.URL.revokeObjectURL.mockClear();
  });

  test('uploads and displays main profile photo', async () => {
    const mainPhotoInput = screen.getByLabelText('Main Profile Photo:');
    const initialPlaceholders = screen.queryAllByText('Photo');
    expect(initialPlaceholders.length).toBeGreaterThanOrEqual(1); // Main placeholder + gallery

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    fireEvent.change(mainPhotoInput, { target: { files: [file] } });

    // Wait for the image to appear
    const profileImage = await screen.findByAltText('Profile');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', 'mock-object-url:chucknorris.png');
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);

    // Check if the main "Photo" text placeholder is gone from the header
    const header = screen.getByRole('banner'); // The header element
    expect(header).not.toHaveTextContent(/^Photo$/); // Regex to match exact "Photo" text
  });

  test('uploads and displays multiple gallery photos', async () => {
    const galleryPhotoInput = screen.getByLabelText('Gallery Photos:');
    
    // Initially, there are 3 gallery placeholders with the text "Photo"
    const initialPlaceholders = screen.getAllByText('Photo').filter(el => el.closest('.photo-gallery'));
    expect(initialPlaceholders.length).toBe(3);

    const files = [
      new File(['(file1)'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['(file2)'], 'photo2.png', { type: 'image/png' }),
    ];

    fireEvent.change(galleryPhotoInput, { target: { files: files } });

    // Wait for gallery images to appear
    const galleryImages = await screen.findAllByAltText(/Gallery photo \d+/);
    expect(galleryImages).toHaveLength(2);
    expect(galleryImages[0]).toHaveAttribute('src', 'mock-object-url:photo1.jpg');
    expect(galleryImages[1]).toHaveAttribute('src', 'mock-object-url:photo2.png');
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);

    // Check if the gallery "Photo" text placeholders are gone
    const galleryPlaceholdersAfter = screen.queryAllByText('Photo').filter(el => el.closest('.photo-gallery'));
    expect(galleryPlaceholdersAfter.length).toBe(0);
  });

  test('appends to existing gallery photos', async () => {
    const galleryPhotoInput = screen.getByLabelText('Gallery Photos:');

    // Upload first batch
    const files1 = [new File(['(file1)'], 'photo1.jpg', { type: 'image/jpeg' })];
    fireEvent.change(galleryPhotoInput, { target: { files: files1 } });
    await screen.findByAltText('Gallery photo 1');
    expect(screen.getAllByAltText(/Gallery photo \d+/)).toHaveLength(1);

    // Upload second batch
    const files2 = [new File(['(file2)'], 'photo2.png', { type: 'image/png' })];
    fireEvent.change(galleryPhotoInput, { target: { files: files2 } });
    
    // Wait for new photo to appear
    await screen.findByAltText('Gallery photo 2');
    const galleryImages = screen.getAllByAltText(/Gallery photo \d+/);
    expect(galleryImages).toHaveLength(2); // Total of 2 images now
    expect(galleryImages[0]).toHaveAttribute('src', 'mock-object-url:photo1.jpg');
    expect(galleryImages[1]).toHaveAttribute('src', 'mock-object-url:photo2.png');
  });
  
  test('calls revokeObjectURL on unmount for main and gallery photos', async () => {
    const { unmount } = render(<App />); // Re-render for this specific test to control unmount

    const mainPhotoInput = screen.getByLabelText('Main Profile Photo:');
    const galleryPhotoInput = screen.getByLabelText('Gallery Photos:');

    const mainFile = new File(['main'], 'main.png', { type: 'image/png' });
    const galleryFile1 = new File(['gallery1'], 'gallery1.jpg', { type: 'image/jpeg' });
    const galleryFile2 = new File(['gallery2'], 'gallery2.jpg', { type: 'image/jpeg' });

    fireEvent.change(mainPhotoInput, { target: { files: [mainFile] } });
    await screen.findByAltText('Profile');

    fireEvent.change(galleryPhotoInput, { target: { files: [galleryFile1, galleryFile2] } });
    await screen.findAllByAltText(/Gallery photo \d+/);
    
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(3); // 1 main + 2 gallery

    unmount();

    expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(3);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url:main.png');
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url:gallery1.jpg');
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url:gallery2.jpg');
  });
});
