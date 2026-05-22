import React from 'react';

const BusinessContextCard = ({ businessContext }) => {
  if (!businessContext || (!businessContext.hasGBPData && !businessContext.derivedFromWebsite)) {
    return null;
  }

  return (
    <div className="business-context-card">
      <h3 className="context-title">📍 Business Context</h3>
      
      <div className="context-content">
        {businessContext.hasGBPData && (
          <div className="context-section">
            <div className="context-badge gbp-badge">✓ Google Business Profile Data</div>
            
            {businessContext.businessName && (
              <div className="context-item">
                <strong>Business Name:</strong> {businessContext.businessName}
              </div>
            )}
            
            {businessContext.businessCategory && (
              <div className="context-item">
                <strong>Category:</strong> {businessContext.businessCategory}
              </div>
            )}
            
            {businessContext.hasRating && businessContext.ratingValue && (
              <div className="context-item">
                <strong>Rating:</strong> ⭐ {businessContext.ratingValue} stars
              </div>
            )}
            
            {businessContext.hasReviews && businessContext.reviewCount && (
              <div className="context-item">
                <strong>Reviews:</strong> {businessContext.reviewCount.toLocaleString()} reviews
              </div>
            )}

            <div className="context-note">
              <small>✓ Business profile data enriches operational context interpretation</small>
            </div>
          </div>
        )}
        
        {businessContext.derivedFromWebsite && !businessContext.hasGBPData && (
          <div className="context-section">
            <div className="context-badge website-badge">🌐 Derived from Website</div>
            
            {businessContext.businessName && (
              <div className="context-item">
                <strong>Business Name:</strong> {businessContext.businessName}
              </div>
            )}
            
            {businessContext.organizationSchema && (
              <div className="context-item">
                <strong>Schema Markup:</strong> ✓ Organization data detected
              </div>
            )}
            
            {businessContext.structuredContact && (
              <>
                {businessContext.structuredContact.email?.length > 0 && (
                  <div className="context-item">
                    <strong>Email:</strong> {businessContext.structuredContact.email[0]}
                  </div>
                )}
                {businessContext.structuredContact.phone?.length > 0 && (
                  <div className="context-item">
                    <strong>Phone:</strong> {businessContext.structuredContact.phone[0]}
                  </div>
                )}
              </>
            )}

            <div className="context-note">
              <small>ℹ️ Business context derived from publicly accessible website data</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessContextCard;