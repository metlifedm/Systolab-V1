import React from 'react';

const BusinessContextCard = ({ businessContext }) => {

  if (
    !businessContext ||
    (
      !businessContext.hasGBPData &&
      !businessContext.derivedFromWebsite
    )
  ) {
    return null;
  }

  return (
    <div className="business-context-card">

      <h3 className="context-title">
        📍 Business Context
      </h3>

      <div className="context-content">

        {/* ================================================= */}
        {/* GBP CONTEXT */}
        {/* ================================================= */}

        {businessContext.hasGBPData && (

          <div className="context-section">

            <div className="context-badge gbp-badge">
              ✓ Google Business Profile Data
            </div>

            {/* BUSINESS NAME */}
            {businessContext.businessName && (
              <div className="context-item">
                <strong>Business Name:</strong>
                <span>
                  {businessContext.businessName}
                </span>
              </div>
            )}

            {/* CATEGORY */}
            {businessContext.businessCategory && (
              <div className="context-item">
                <strong>Category:</strong>
                <span>
                  {businessContext.businessCategory}
                </span>
              </div>
            )}

            {/* RATING */}
            {businessContext.hasRating &&
              businessContext.ratingValue && (
                <div className="context-item">
                  <strong>Rating:</strong>

                  <span>
                    ⭐ {businessContext.ratingValue} stars
                  </span>
                </div>
              )
            }

            {/* REVIEWS */}
            {businessContext.hasReviews &&
              businessContext.reviewCount && (
                <div className="context-item">
                  <strong>Reviews:</strong>

                  <span>
                    {businessContext.reviewCount.toLocaleString()} reviews
                  </span>
                </div>
              )
            }

            {/* ADDRESS */}
            {businessContext.address && (
              <div className="context-item">
                <strong>Address:</strong>

                <span>
                  {businessContext.address}
                </span>
              </div>
            )}

            {/* PHONE */}
            {businessContext.phone && (
              <div className="context-item">
                <strong>Phone:</strong>

                <span>
                  {businessContext.phone}
                </span>
              </div>
            )}

            {/* WEBSITE */}
            {businessContext.website && (
              <div className="context-item">
                <strong>Website:</strong>

                <a
                  href={businessContext.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="context-link"
                >
                  Visit Website
                </a>
              </div>
            )}

            {/* COMPLETENESS SCORE */}
            {businessContext.profileCompleteness && (
              <div className="context-item">
                <strong>Profile Completeness:</strong>

                <span>
                  {businessContext.profileCompleteness}%
                </span>
              </div>
            )}

            {/* NOTE */}
            <div className="context-note">
              <small>
                ✓ Business profile data enriches operational context interpretation
              </small>
            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* WEBSITE-DERIVED CONTEXT */}
        {/* ================================================= */}

        {businessContext.derivedFromWebsite &&
          !businessContext.hasGBPData && (

            <div className="context-section">

              <div className="context-badge website-badge">
                🌐 Derived from Website
              </div>

              {/* BUSINESS NAME */}
              {businessContext.businessName && (
                <div className="context-item">
                  <strong>Business Name:</strong>

                  <span>
                    {businessContext.businessName}
                  </span>
                </div>
              )}

              {/* CATEGORY */}
              {businessContext.businessCategory && (
                <div className="context-item">
                  <strong>Category:</strong>

                  <span>
                    {businessContext.businessCategory}
                  </span>
                </div>
              )}

              {/* SCHEMA */}
              {businessContext.organizationSchema && (
                <div className="context-item">
                  <strong>Schema Markup:</strong>

                  <span>
                    ✓ Organization data detected
                  </span>
                </div>
              )}

              {/* EMAIL */}
              {businessContext.structuredContact?.email?.length > 0 && (
                <div className="context-item">
                  <strong>Email:</strong>

                  <span>
                    {businessContext.structuredContact.email[0]}
                  </span>
                </div>
              )}

              {/* PHONE */}
              {businessContext.structuredContact?.phone?.length > 0 && (
                <div className="context-item">
                  <strong>Phone:</strong>

                  <span>
                    {businessContext.structuredContact.phone[0]}
                  </span>
                </div>
              )}

              {/* ADDRESS */}
              {businessContext.structuredContact?.address?.length > 0 && (
                <div className="context-item">
                  <strong>Address:</strong>

                  <span>
                    {businessContext.structuredContact.address[0]}
                  </span>
                </div>
              )}

              {/* NOTE */}
              <div className="context-note">
                <small>
                  ℹ️ Business context derived from publicly accessible website data
                </small>
              </div>

            </div>
          )
        }

      </div>
    </div>
  );
};

export default BusinessContextCard;