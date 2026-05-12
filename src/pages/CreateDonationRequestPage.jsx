import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHandHoldingHeart } from 'react-icons/fa';
import CreateDonationRequestModal from '../components/modals/CreateDonationRequestModal';
import { locationsService } from '../services/locationsService';

const CreateDonationRequestPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await locationsService.getLocations();
        const items =
          Array.isArray(response) ? response :
          Array.isArray(response?.items) ? response.items :
          Array.isArray(response?.data) ? response.data :
          Array.isArray(response?.value) ? response.value :
          [];

        console.log('CREATE DONATION REQUEST LOCATIONS:', items);
        setLocations(items);
      } catch (error) {
        console.error('Failed to fetch locations for donation request page:', error);
      }
    };

    loadLocations();
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    navigate('/my-donation-requests');
  };

  const handleSuccess = () => {
    console.log('Donation request created successfully');
  };

  return (
    <div className="create-donation-page p-6">
      <div className="create-donation-page__container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="create-donation-page__hero">
          <div className="create-donation-page__heroGroup">
            <div className="create-donation-page__heroIcon">
              <FaHandHoldingHeart className="text-pink-400 text-3xl" />
            </div>
            <div className="create-donation-page__heroText">
              <h1 className="create-donation-page__heroTitle">طلب تبرع</h1>
              <p className="create-donation-page__heroSubtitle">إنشاء طلب جديد من خلال نموذج منظم وواضح.</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="create-donation-page__panel">
          <p className="create-donation-page__noticeText">جاري فتح نموذج طلب التبرع، وسيظهر بنفس التنسيق حتى عند تعطل Tailwind.</p>
        </motion.div>
      </div>
      <CreateDonationRequestModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        locations={locations}
      />
    </div>
  );
};

export default CreateDonationRequestPage;
