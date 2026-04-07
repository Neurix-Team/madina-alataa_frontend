import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaChild,
  FaFileAlt,
  FaHospital,
  FaMoneyBillWave,
  FaPaperPlane,
} from 'react-icons/fa';
import RocketBackground from '../components/common/RocketBackground';
import CanvasBackground from '../components/common/CanvasBackground';
import AnimatedBackground from '../components/common/AnimatedBackground';

const CHILDREN_DATA = [
  {
    id: 1,
    name: 'أحمد محمد',
    age: 9,
    city: 'القاهرة',
  },
  {
    id: 2,
    name: 'سارة علي',
    age: 7,
    city: 'الجيزة',
  },
  {
    id: 3,
    name: 'يوسف حسن',
    age: 11,
    city: 'الإسكندرية',
  },
];

const REQUEST_TYPES = [
  'طبية',
  'تعليمية',
  'اجتماعية',
  'أخرى',
];

const CSS = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  .create-request-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .create-request-card {
    max-width: 600px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 1;
  }

  .create-request-title {
    text-align: center;
    color: #333;
    font-size: 28px;
    font-weight: 900;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    animation: slideInDown 0.5s ease-out;
  }

  .form-group {
    margin-bottom: 20px;
    animation: fadeIn 0.4s ease-out;
  }

  .form-group:nth-child(1) { animation-delay: 0.1s; }
  .form-group:nth-child(2) { animation-delay: 0.2s; }
  .form-group:nth-child(3) { animation-delay: 0.3s; }
  .form-group:nth-child(4) { animation-delay: 0.4s; }
  .form-group:nth-child(5) { animation-delay: 0.5s; }
  .form-group:nth-child(6) { animation-delay: 0.6s; }

  .form-label {
    display: block;
    color: #555;
    font-weight: 700;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    font-size: 16px;
    font-family: 'Cairo', sans-serif;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: #fff;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .file-input-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .file-input {
    display: none;
  }

  .file-input-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 12px 16px;
    border: 2px dashed #e1e5e9;
    border-radius: 12px;
    background: #f8f9fa;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    color: #666;
    font-weight: 600;
  }

  .file-input-label:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-2px);
  }

  .submit-btn {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: 'Cairo', sans-serif;
    animation: fadeIn 0.5s ease-out 0.7s both;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }

  .submit-btn:active {
    transform: translateY(0);
  }
`;

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    childId: '',
    requestType: '',
    description: '',
    hospital: '',
    amount: '',
    documents: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      documents: e.target.files,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Submitting request:', formData);
    alert('تم إرسال الطلب بنجاح! سيتم مراجعته قريباً.');
    navigate('/parents');
  };

  return (
    <>
      <style>{CSS}</style>
      <CanvasBackground />
      <RocketBackground />
      <AnimatedBackground />
      <div className="create-request-container">
        <div className="create-request-card">
          <h1 className="create-request-title">
            <FaPlus />
            إنشاء طلب جديد
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="childId">
                <FaChild style={{ marginLeft: 8 }} />
                اختيار الطفل
              </label>
              <select
                id="childId"
                name="childId"
                value={formData.childId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">اختر الطفل...</option>
                {CHILDREN_DATA.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} - {child.age} سنوات - {child.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="requestType">
                نوع الطلب
              </label>
              <select
                id="requestType"
                name="requestType"
                value={formData.requestType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">اختر نوع الطلب...</option>
                {REQUEST_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                وصف الحالة
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="وصف تفصيلي لحالة الطفل واحتياجاته..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hospital">
                <FaHospital style={{ marginLeft: 8 }} />
                المستشفى أو المؤسسة
              </label>
              <input
                type="text"
                id="hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                className="form-input"
                placeholder="اسم المستشفى أو المؤسسة التعليمية..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                <FaMoneyBillWave style={{ marginLeft: 8 }} />
                المبلغ المطلوب (بالجنيه المصري)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="المبلغ المطلوب..."
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="documents">
                <FaFileAlt style={{ marginLeft: 8 }} />
                المستندات
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  onChange={handleFileChange}
                  className="file-input"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <label htmlFor="documents" className="file-input-label">
                  <FaFileAlt />
                  اختر الملفات (PDF, صور, مستندات)
                  {formData.documents && formData.documents.length > 0 && (
                    <span style={{ marginRight: 10, color: '#667eea' }}>
                      ({formData.documents.length} ملف مختار)
                    </span>
                  )}
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">
              <FaPaperPlane />
              إرسال الطلب
            </button>
          </form>
        </div>
      </div>
    </>
  );
}