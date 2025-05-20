import React, { useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Link } from 'react-router-dom';
import './MapPage.css';

const MAP_IMAGE = '/map_agh.jpg';
const MAP_PDF = '/map_agh.pdf';

const buildings = [
  "A0 - Rectorate",
  "A4 - Faculty of Civil Engineering and Resource Management",
  "B5 - Faculty of Metal Engineering and Industrial Computer Science",
  "B1 - Faculty of Electrical Engineering, Automation, Computer Science, and Biomedical Engineering",
  "D5 / D6 - Faculty of Computer Science, Electronics, and Telecommunications",
  "B2 - Faculty of Mechanical Engineering and Robotics",
  "A0 - Faculty of Geology, Geophysics, and Environmental Protection",
  "C4 - Faculty of Mining Surveying and Environmental Engineering",
  "B8 - Faculty of Materials Engineering and Ceramics",
  "D8 - Faculty of Foundry",
  "A2 - Faculty of Non-Ferrous Metals",
  "A1 - Faculty of Drilling, Oil, and Gas",
  "D14 - Faculty of Management",
  "D4 - Faculty of Energy and Fuels",
  "D10 - Faculty of Physics and Applied Computer Science",
  "B7 / B9 - Faculty of Applied Mathematics",
  "C6 / C7 - Faculty of Humanities",
  "D17 - Faculty of Computer Science",
  "D16 - AGH Academic Centre for Materials and Nanotechnology",
  "C5 / C6 - AGH Energy Centre",
  "U1 - Main Library",
  "C3 - Foreign Languages Centre",
  "U13 - Physical Education and Sports Centre",
  "U11 - AGH Swimming Pool",
  "Z2 - AGH E-Learning and Innovative Teaching Centre",
  "D15 / D18 - AGH Academic Computer Centre CYFRONET",
  "C1 - AGH IT Sector",
  "C1 - Education Organisation Centre",
  "C1 - Student Affairs Centre",
  "U2 - Recruitment Centre",
  "U2 - AGH-UNESCO International Centre for Promotion of Technology and Education",
  "A3 - International Students Office",
  "A3 - AGH Doctoral School",
  "U9 - AGH Student Village",
  "S1 - University Student Council",
  "D12 - Student Design Centre",
  "S2 - Career Centre",
  "C1 - Technology Transfer Centre",
  "C1 - Department of Cooperation with Administration and Industry",
  "C5 - Krakow Centre for Innovative Technologies INNOAGH",
  "C2 - Project Support Centre",
  "C1 - Science Support Centre",
  "B3 - Space Technology Centre",
  "C1 - International Affairs Centre",
  "DS-Alfa - Office for Disabled Persons",
  "A0 - Geological Museum of the Faculty of Geology, Geophysics, and Environmental Protection",
  "U3 - AGH Publishing House",
  "U7 - Academic Cultural Centre 'Studio' Club",
  "DS-Alfa - Student Club 'Gwarek'",
  "DS-7 - Student Club 'Zaścianek'",
  "DS-4 - Student Club 'Filutek'",
  "Z13 - Music Studio 'Kotłownia'"           
];

const MapPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="map-page-outer">
      <div className="map-title-bg">
        <div className="map-title">AGH map</div>
      </div>
      <div className="map-breadcrumb">
        <Link to="/home" className="home-link no-underline">Home page</Link> / AGH map
      </div>
      <div className="map-content-row">
        <div className="image-and-download">
          <div className="image-preview-wrapper">
            <img
              src={MAP_IMAGE}
              alt="AGH Campus Map"
              className="map-image"
              onClick={() => setIsOpen(true)}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
          <div className="download-section">
            <a
              href={MAP_PDF}
              download="AGH_campus_map_printable.pdf"
              className="download-link"
            >
              <strong>AGH campus map in printable version (PDF file, CMYK, 1.3MB)</strong>
            </a>
            <a
              href={MAP_IMAGE}
              target="_blank"
              rel="noopener noreferrer"
              className="download-link"
            >
              <strong>AGH campus map in screen version (JPG, RGB file, 980KB)</strong>
            </a>
          </div>
        </div>
        <div className="building-list">
          <h3>Buildings</h3>
          <ol>
            {buildings.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ol>
        </div>
      </div>
      {isOpen && (
        <Lightbox
          mainSrc={MAP_IMAGE}
          onCloseRequest={() => setIsOpen(false)}
          imageTitle="AGH Campus Map"
          toolbarButtons={[
            <a
              key="download-pdf"
              href={MAP_PDF}
              download="AGH_campus_map_printable.pdf"
              className="lightbox-toolbar-btn"
              title="Download PDF"
            >PDF</a>,
            <button
              key="fullscreen"
              className="lightbox-toolbar-btn"
              title="Fullscreen"
              onClick={() => {
                const el = document.querySelector('.ril-image-current');
                if (el && el.requestFullscreen) el.requestFullscreen();
              }}
            >⛶</button>
          ]}
          enableZoom={true}
          animationDuration={0}
          animationDisabled={true}
          reactModalStyle={{
            overlay: { backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 2000 }
          }}
        />
      )}
    </div>
  );
};

export default MapPage;
