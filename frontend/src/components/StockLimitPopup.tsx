import React from 'react';
import './StockLimitPopup.css';

interface StockLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  availableStock?: number;
  requestedQuantity?: number;
}

export const StockLimitPopup: React.FC<StockLimitPopupProps> = ({
  isOpen,
  onClose,
  message,
  availableStock,
  requestedQuantity
}) => {
  if (!isOpen) return null;

  return (
    <div className="stock-popup-overlay" onClick={onClose}>
      <div className="stock-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="stock-popup-header">
          <h3>⚠️ Stock Limit Reached</h3>
          <button className="stock-popup-close" onClick={onClose}>×</button>
        </div>
        
        <div className="stock-popup-body">
          <p className="stock-popup-message">{message}</p>
          
          {availableStock !== undefined && (
            <div className="stock-popup-details">
              <p><strong>Available Stock:</strong> {availableStock}</p>
              {requestedQuantity !== undefined && (
                <p><strong>Requested Quantity:</strong> {requestedQuantity}</p>
              )}
              <p><strong>Maximum You Can Add:</strong> {availableStock}</p>
            </div>
          )}
        </div>
        
        <div className="stock-popup-footer">
          <button className="stock-popup-ok-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}; 