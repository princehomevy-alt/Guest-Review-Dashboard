# Guest Review Operational Intelligence Dashboard
## Data Model & Architecture

### Project Overview
Production-ready dashboard for managing 300+ rental units across multiple platforms. Tracks reviews, guest loyalty, operational issues, and actionable insights.

---

## Firestore Collections Schema

### 1. **properties** Collection
Stores all rental unit information.

```
properties/{propertyId}
├── propertyName (string) - Unit identifier
├── location (string) - Address
├── city (string) - City name
├── platform (string) - Airbnb | Booking.com | Direct
├── owner (string) - Owner name
├── status (string) - Active | Inactive | Maintenance
├── unitType (string) - Studio | 1BR | 2BR | 3BR | House
├── totalReviews (number) - Count of reviews
├── averageRating (number) - Calculated average 1-5
├── lastReviewDate (timestamp) - Last review timestamp
├── createdAt (timestamp) - Property creation date
└── updatedAt (timestamp) - Last update
```

### 2. **reviews** Collection
Tracks individual guest reviews and ratings.

```
reviews/{reviewId}
├── propertyId (reference) - Link to property
├── guestId (reference) - Link to guest
├── rating (number) - 1-5 scale
├── ratingCategory (string) - Low | Medium | High (auto-calculated)
├── comment (string) - Guest feedback text
├── platform (string) - Source: Airbnb | Booking.com | Direct
├── sentiment (string) - Positive | Neutral | Negative (auto-calculated)
├── issueCategory (array) - [Cleaning, Maintenance, Communication, Check-in, Noise, Other]
├── reviewDate (timestamp) - When review was posted
├── createdAt (timestamp) - When entered in system
└── archived (boolean) - Soft delete flag
```

### 3. **guests** Collection
Loyalty tracking and repeat guest identification.

```
guests/{guestId}
├── guestName (string) - Full name
├── email (string) - Contact email
├── phone (string) - Contact phone
├── totalBookings (number) - Repeat visit count
├── loyaltyLevel (string) - New | Repeat | VIP
├── lastStay (timestamp) - Most recent booking end
├── averageRating (number) - Guest's average rating received
├── notes (string) - Internal notes
└── createdAt (timestamp) - First booking date
```

### 4. **actionPlans** Collection
Operational issues and resolution tracking.

```
actionPlans/{actionId}
├── issueCategory (string) - Cleaning | Maintenance | Communication | Check-in | Noise | Other
├── relatedPropertyId (reference) - Property affected
├── frequency (number) - How many times reported
├── impactLevel (string) - Low | Medium | High
├── actionDescription (string) - What needs to be done
├── assignedTo (string) - Team member responsible
├── deadline (timestamp) - Target resolution date
├── status (string) - Pending | In Progress | Completed
├── createdAt (timestamp) - Issue creation date
├── resolvedAt (timestamp) - Completion date (null if open)
└── resolution (string) - How it was resolved
```

---

## Executive KPIs (Real-Time Calculations)

### Dashboard Metrics
1. **Total Reviews This Week** - Count reviews where reviewDate >= 7 days ago
2. **Low Rating Count** - Count reviews where rating <= 2
3. **Medium Rating Count** - Count reviews where rating 3-4
4. **High Rating Count** - Count reviews where rating = 5
5. **Average Rating** - Mean of all review ratings
6. **Weekly Trend** - Ratings grouped by day for 7-day chart
7. **Sentiment Distribution** - % Positive | Neutral | Negative
8. **Platform Comparison** - Average rating by Airbnb vs Booking.com vs Direct
9. **Top 5 Repeated Issues** - Most frequent issue categories
10. **Risk Indicator** - % change in low ratings week-over-week

### Properties Metrics
- Total units: COUNT(properties)
- Active status ratio: Active count / Total
- Average rating by property: Grouped mean
- Review velocity: Reviews per week per property

### Guest Intelligence
- Repeat guest ratio: Guests with totalBookings > 1 / Total guests
- VIP count: loyaltyLevel = "VIP"
- Booking frequency trend: Grouped by month

### Action Tracking
- Open actions: COUNT(status != "Completed")
- Resolution rate: Completed / Total
- Average resolution time: (resolvedAt - createdAt)
- Overdue actions: deadline < now() AND status != "Completed"

---

## Data Relationships

```
Review --[propertyId]--> Property
Review --[guestId]--> Guest
ActionPlan --[relatedPropertyId]--> Property
ActionPlan --[issueCategory]--> Issue Types (derived from reviews)
Guest --[totalBookings]--> Review count per guest
```

---

## Firebase Security Rules (Development)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Read all collections (development - restrict in production)
    match /{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid != null;
    }
  }
}
```

---

## Scaling to SaaS Architecture

### Phase 1: Multi-Tenancy (Month 2-3)
- Add `tenantId` field to all collections
- Create `tenants` collection for company accounts
- Implement row-level security per tenant
- Rate limiting per tenant

### Phase 2: User & Role Management (Month 3-4)
- Auth via Firebase Authentication
- Roles: Admin | Manager | Reviewer | Guest (view-only)
- Activity logging for compliance
- Per-role permission matrix

### Phase 3: Advanced Features (Month 4-6)
- CSV/Excel import/export
- Email alert system
- Scheduled PDF reports
- Guest sentiment NLP analysis
- Predictive maintenance alerts
- Review auto-response templates

### Phase 4: Enterprise (Month 6+)
- SSO integration (Okta, Google Workspace)
- Custom branding per tenant
- API access for PMS integration
- Data export compliance (GDPR)
- Advanced analytics (forecasting, seasonality)

---

## File Structure

```
/project
├── index.html                 # Landing/router
├── data-model.md             # This file
├── css/
│   └── style.css             # All styling (light/dark modes)
├── js/
│   ├── firebase.js           # Firebase config & connection
│   ├── api.js                # Data layer (CRUD operations)
│   ├── dashboard.js          # Dashboard logic & calculations
│   ├── properties.js         # Properties management
│   ├── reviews.js            # Reviews management
│   ├── guests.js             # Guest loyalty tracking
│   ├── actions.js            # Action plan management
│   └── utils.js              # Shared utilities & helpers
└── pages/
    ├── dashboard.html        # Executive dashboard
    ├── properties.html       # Properties management
    ├── reviews.html          # Review entry & history
    ├── guests.html           # Repeat guest analytics
    └── actions.html          # Action plan tracking
```

---

## Implementation Timeline

### Day 1
- [ ] Firebase project setup & Firestore creation
- [ ] HTML structure for all pages
- [ ] CSS styling (light/dark mode)
- [ ] Firebase connection & auth
- [ ] Basic CRUD operations (api.js)

### Day 2
- [ ] Dashboard metrics calculation
- [ ] Chart.js integration
- [ ] Properties management UI
- [ ] Reviews form & filtering
- [ ] GitHub Pages deployment
- [ ] Sample data loading
- [ ] Testing & bug fixes

---

## Development & Deployment Checklist

### Pre-Deployment
- [ ] Firebase Firestore created with security rules
- [ ] GitHub repository created
- [ ] GitHub Pages enabled
- [ ] All CORS issues resolved
- [ ] Error handling tested
- [ ] Mock data loaded
- [ ] Dark mode tested
- [ ] Mobile responsiveness checked

### Post-Deployment
- [ ] Dashboard loads and displays data
- [ ] Add/edit properties work
- [ ] Add reviews works
- [ ] Charts render correctly
- [ ] Filters functional
- [ ] Light/dark toggle works
- [ ] Error messages display properly

---

## Future Enhancement Priorities

1. **High Priority** - Complete in Month 1
   - User authentication & roles
   - CSV import functionality
   - Email notifications
   - Basic NLP sentiment detection

2. **Medium Priority** - Complete in Month 2-3
   - Advanced filtering & search
   - Custom date range selection
   - Scheduled report generation
   - Review auto-response system

3. **Low Priority** - Complete in Month 3+
   - Predictive analytics
   - Machine learning for pattern detection
   - Mobile app (React Native)
   - API for 3rd party integration

---

## Notes for Development

- All timestamps use Firebase Timestamp format
- Rating categories auto-calculated: 1-2=Low, 3-4=Medium, 5=High
- Sentiment defaults to Neutral, can be auto-detected or manual
- Weekly calculations use ISO week standard
- All numbers rounded to 2 decimal places for display
- Charts update every 30 seconds (configurable)
- Maximum batch size for Firestore: 500 documents per transaction
