const gallery = document.getElementById('gallery');

// ========================================
// TO USE YOUR OWN IMAGES:
// 1. Create a folder called "images" in the same directory as this file
// 2. Put your photos in the "images" folder
// 3. Replace the filenames below with your own image filenames
// 4. You can add or remove images from this array as needed
// ========================================

// ========================================
// IMAGE GALLERY SETUP
// ========================================
// First 2 rows of images (12 images) - these will be looped for the rest of the page
const firstTwoRows = [
    'images/photo1.jpg',
    'images/photo2.jpg',
    'images/photo3.jpg',
    'images/photo4.jpg',
    'images/photo5.jpg',
    'images/photo6.jpg',
    'images/photo7.jpg',
    'images/photo8.jpg',
    'images/photo9.jpg',
    'images/photo10.jpg',
    'images/photo11.jpg',
    'images/photo12.jpg'
];

// Calculate how many times to loop to fill the page
// Estimate: need enough images to fill ~400vh of scroll with grid layout
// Grid shows ~6 images per viewport height, so need ~24-30 images minimum
const imagesNeeded = 30;
const loopedImages = [];

// Loop the first 2 rows to fill the page
for (let i = 0; i < imagesNeeded; i++) {
    loopedImages.push(firstTwoRows[i % firstTwoRows.length]);
}

// Create gallery images from looped array
loopedImages.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add('gallery-image');
    img.alt = `Gallery photo ${(i % firstTwoRows.length) + 1}`;
    gallery.appendChild(img);
});

// Easter egg for footer links
const footerLeft = document.querySelector('.footer-left');
const originalFooterHTML = footerLeft.innerHTML;
let timeoutId;

function attachFooterListeners() {
    document.querySelectorAll('.footer-left a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear any existing timeout
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            
            footerLeft.innerHTML = 'lol this doesn\'t do anything';
            
            timeoutId = setTimeout(() => {
                footerLeft.innerHTML = originalFooterHTML;
                attachFooterListeners();
            }, 3000);
        });
    });
}

attachFooterListeners();

// ========================================
// SCROLL DETECTION & SECTION ANIMATIONS
// ========================================

// Get references to all sections and marquee
const marqueeContainer = document.getElementById('marqueeContainer');
const aboutMeSection = document.getElementById('aboutMe');
const projectsSection = document.getElementById('projects');
const getInTouchSection = document.getElementById('getInTouch');

// ========================================
// NAVBAR CLICK - HIDE MARQUEE QUICKLY
// ========================================
// When navbar links are clicked, hide marquee quickly for cleaner navigation
const navLinks = document.querySelectorAll('.nav-bar a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (marqueeContainer) {
            marqueeContainer.classList.add('hidden');
        }
        // Show marquee again after scrolling (when section comes into view)
        setTimeout(() => {
            const targetId = link.getAttribute('href');
            if (targetId) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                // Keep marquee hidden when on section
                                marqueeContainer.classList.add('hidden');
                            } else {
                                // Show marquee when scrolling away from section
                                marqueeContainer.classList.remove('hidden');
                            }
                        });
                    }, { threshold: 0.3 });
                    observer.observe(targetSection);
                }
            }
        }, 100);
    });
});

// Set up Intersection Observer for sections - only show after scrolling down
// Sections fade in and slide up with micro-animation when they come into view
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Only trigger animation if user has scrolled down (not at top of page)
        if (entry.isIntersecting && window.scrollY > 100) {
            entry.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.2,  // Trigger when 20% of section is visible
    rootMargin: '-10% 0px -10% 0px'  // Add buffer for smoother triggering
});

// Observe all sections for scroll-triggered animations
[aboutMeSection, projectsSection, getInTouchSection].forEach(section => {
    if (section) {
        sectionObserver.observe(section);
    }
});

// ========================================
// PROJECT EXPANSION FUNCTIONALITY
// ========================================

// Get references to project elements
const projectBoxes = document.querySelectorAll('.project-box');
const projectExpanded = document.getElementById('projectExpanded');
const closeProjectBtn = document.getElementById('closeProject');
const expandedTitle = document.getElementById('expandedTitle');
const expandedInfo = document.getElementById('expandedInfo');
const expandedMedia = document.getElementById('expandedMedia');

// ========================================
// PROJECT DATA STRUCTURE
// ========================================
// TO EDIT PROJECTS: This is where you edit the detailed project information
// that appears in the expanded view when a project box is clicked.
//
// Each project has:
//   - title: The project name (displayed at top of expanded view)
//   - info: Detailed description text (displayed in left column)
//   - mediaType: Either 'images' for image gallery or 'youtube' for video embed
//   - mediaContent: 
//       * For 'images': Array of image file paths
//       * For 'youtube': YouTube embed URL (format: https://www.youtube.com/embed/VIDEO_ID)
//
// NOTE: Project titles and one-liners in the grid view are edited in index.html
//       This projectData object only controls the expanded view content.
// ========================================
const projectData = {
    1: {
        title: 'Project Title 1',
        info: 'Detailed information about Project 1. This is where you would describe the project, its purpose, technologies used, challenges overcome, and outcomes achieved.',
        mediaType: 'images', // or 'youtube'
        mediaContent: [
            'images/photo1.jpg',
            'images/photo2.jpg',
            'images/photo3.jpg'
        ]
    },
    2: {
        title: 'Project Title 2',
        info: 'Detailed information about Project 2. This project demonstrates different capabilities and showcases another aspect of your work.',
        mediaType: 'youtube',
        mediaContent: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // YouTube embed URL
    },
    3: {
        title: 'Project Title 3',
        info: 'Detailed information about Project 3. Here you can provide comprehensive details about this specific project.',
        mediaType: 'images',
        mediaContent: [
            'images/photo4.jpg',
            'images/photo5.jpg'
        ]
    },
    4: {
        title: 'Project Title 4',
        info: 'Detailed information about Project 4. Final project details and information.',
        mediaType: 'images',
        mediaContent: [
            'images/photo6.jpg',
            'images/photo7.jpg',
            'images/photo8.jpg'
        ]
    }
};

// ========================================
// IMAGE GALLERY WITH THUMBNAIL NAVIGATION
// ========================================

// Track currently selected image index
let currentImageIndex = 0;
let projectImages = [];

/**
 * Creates image gallery with main image and clickable thumbnails
 * Layout: Large main image on top, mini thumbnails below
 * Clicking thumbnails switches the main image
 * 
 * @param {Array} images - Array of image file paths
 */
function createImageGallery(images) {
    projectImages = images;
    currentImageIndex = 0;
    
    // Create main image
    const mainImageHTML = `
        <img src="${images[0]}" alt="Project image 1" class="main-image" id="mainProjectImage">
    `;
    
    // Create thumbnail gallery (only if more than one image)
    let thumbnailsHTML = '';
    if (images.length > 1) {
        thumbnailsHTML = `
            <div class="thumbnail-container">
                ${images.map((img, index) => `
                    <img src="${img}" 
                         alt="Thumbnail ${index + 1}" 
                         class="thumbnail ${index === 0 ? 'active' : ''}"
                         data-index="${index}"
                         onclick="switchImage(${index})">
                `).join('')}
            </div>
        `;
    }
    
    expandedMedia.innerHTML = mainImageHTML + thumbnailsHTML;
}

/**
 * Switches the main image when a thumbnail is clicked
 * Updates the main image src and highlights the active thumbnail
 * 
 * @param {number} index - Index of the image to display
 */
function switchImage(index) {
    if (index >= 0 && index < projectImages.length) {
        currentImageIndex = index;
        
        // Update main image
        const mainImage = document.getElementById('mainProjectImage');
        if (mainImage) {
            mainImage.src = projectImages[index];
        }
        
        // Update active thumbnail
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            if (i === index) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }
}

// Make switchImage globally accessible for onclick handlers
window.switchImage = switchImage;

/**
 * Expands a project to full-screen view
 * Displays project title, info text, and media (images or YouTube)
 * Layout is side-by-side: text on left, images on right
 * 
 * @param {number} projectId - The project ID from projectData (1, 2, 3, or 4)
 */
function expandProject(projectId) {
    const project = projectData[projectId];
    if (!project) return;
    
    // Set project title and info text in left column
    expandedTitle.textContent = project.title;
    expandedInfo.innerHTML = `<p>${project.info}</p>`;
    
    // Ensure text column wrapper exists
    const textColumn = document.querySelector('.expanded-text-column');
    if (!textColumn || !textColumn.contains(expandedTitle)) {
        // If structure is wrong, we need to fix it
        console.warn('Expanded content structure may need adjustment');
    }
    
    // Handle different media types
    if (project.mediaType === 'youtube') {
        // YouTube embed - single iframe
        expandedMedia.innerHTML = `
            <iframe src="${project.mediaContent}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        `;
    } else if (project.mediaType === 'images') {
        // Image gallery with thumbnails
        createImageGallery(project.mediaContent);
    }
    
    // Show expanded view with animation
    projectExpanded.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Closes the expanded project view
 * Hides overlay and restores page scrolling
 */
function closeExpandedProject() {
    projectExpanded.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// ========================================
// EVENT LISTENERS
// ========================================

// Add click handlers to project boxes - expands project on click
projectBoxes.forEach(box => {
    box.addEventListener('click', () => {
        const projectId = parseInt(box.getAttribute('data-project'));
        expandProject(projectId);
    });
});

// Close button - X button in top right corner
if (closeProjectBtn) {
    closeProjectBtn.addEventListener('click', closeExpandedProject);
}

// Close on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectExpanded.classList.contains('active')) {
        closeExpandedProject();
    }
});

// Close on background click - clicking outside the content area closes the modal
projectExpanded.addEventListener('click', (e) => {
    if (e.target === projectExpanded) {
        closeExpandedProject();
    }
});