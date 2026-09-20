GeoHarmonize
Automated Integration & Harmonization of Cadastral, UAV Drone, and Master Plan Data
� � � � �
Overview
GeoHarmonize is a full-stack geospatial data integration and harmonization platform developed for urban land-record management. It is designed to identify and reconcile inconsistencies between multiple sources of land information, including:
Traditional cadastral and survey records
UAV/drone orthophoto measurements
Urban master plan and zoning layers
Registered deed area and surveyed area records
The platform provides a GIS-focused workbench where users can inspect parcels, visualize spatial layers, investigate boundary conflicts, run automated harmonization, and maintain an audit trail of system actions.
Important: GeoHarmonize is a prototype and decision-support system. Its automated outputs and AI-generated legal explanations must be reviewed and validated by qualified surveyors, legal professionals, and relevant authorities before being used for official land-record decisions.
Problem Statement
Urban land information is frequently maintained across different systems and data sources. Differences in surveying methods, coordinate reference systems, digitization quality, physical construction boundaries, and outdated maps can create:
Parcel boundary overlaps
Encroachment indicators
Sliver gaps between polygons
Area discrepancies
Zoning violations
Coordinate reference system (CRS) inconsistencies
These conflicts can make land administration slower, less transparent, and more difficult to verify.
GeoHarmonize addresses this challenge by bringing relevant spatial and parcel information into a unified interface and providing rule-based tools for conflict inspection and harmonization.
Objectives
Integrate multiple urban land-data sources into one platform.
Identify and display parcel-level spatial conflicts.
Support automated boundary reconciliation workflows.
Provide AI-assisted explanations for detected conflicts.
Maintain parcel status, confidence scores, and resolution metadata.
Provide analytics for monitoring harmonization progress.
Maintain an audit trail for important system actions.
Support MongoDB Atlas connectivity while allowing local persistent operation.
Core Features
1. GIS Harmonization Workbench
View and inspect land parcels.
Display spatial layers with configurable visibility and opacity.
Select parcels and inspect their metadata.
Visualize harmonized and conflicted land records.
2. Multi-Source Data Integration
The application models and combines information from:
Cadastral records
Drone orthophoto surveys
Master plan data
Harmonized parcel geometries
Each parcel can include survey information, owner metadata, land use, area measurements, geometry, source layers, and coordinate reference system information.
3. Conflict Detection and Inspection
The project supports conflict categories such as:
Encroachment
Overlap
Sliver gap
Area discordance
Zoning violation
CRS skew
Each conflict may include severity, affected layers, conflict area, description, centroid coordinates, and associated parcels.
4. Automated Harmonization
The backend includes geospatial processing utilities for:
Polygon area calculation
Polygon centroid calculation
ULPIN generation
Polygon simplification using the Douglas–Peucker approach
Vertex snapping
Shared boundary reconciliation
The batch harmonization endpoint can process unresolved conflicts and update parcel and conflict statuses.
5. Gemini AI-Assisted Analysis
The application can request an AI-generated explanation for a conflict. The response structure includes:
Potential technical cause
Referenced legal precedent or framework
Recommended action
Confidence value
Statutory section field
AI output should be treated as an assistive explanation rather than verified legal advice. Legal references require independent validation against applicable legislation, rules, and jurisdiction-specific procedures.
6. MongoDB Atlas Integration
MongoDB Atlas connection support
Database status monitoring
Collection count reporting
Local persistent fallback mode
Sample database reset functionality
7. Audit Trail
The system records key actions, including:
Parcel updates
Conflict resolution
Batch harmonization
Database reset events
Audit entries contain an actor, action, parcel reference, timestamp, details, and signature hash field.
8. Analytics and Reporting
The application exposes harmonization metrics such as:
Total parcels
Harmonized parcels
Conflicted parcels
Resolved conflicts
Active conflicts
Total land area
Average discrepancy
Harmonization rate
Technology Stack
Layer
Technology
Frontend
React + TypeScript
Build Tool
Vite
Backend
Node.js + Express.js
Database
MongoDB / MongoDB Atlas
AI Integration
Google Gemini API
Styling
Tailwind CSS
Icons
Lucide React
Data Format
TypeScript interfaces and GeoJSON-style polygons
Package Manager
Bun
Development Language
TypeScript
System Architecture
┌──────────────────────────┐
                 │      React Frontend      │
                 │  GIS Workbench + Modals  │
                 └────────────┬─────────────┘
                              │ REST API
                 ┌────────────▼─────────────┐
                 │     Express Backend      │
                 │   API Routes + Services  │
                 └──────┬─────────┬─────────┘
                        │         │
          ┌─────────────▼───┐ ┌───▼────────────────┐
          │ Harmonization   │ │ Gemini AI Service  │
          │ Engine          │ │ Conflict Analysis │
          └─────────────┬───┘ └────────────────────┘
                        │
                 ┌──────▼─────────────┐
                 │ Database Service   │
                 │ MongoDB / Fallback │
                 └────────────────────┘
Project Structure
geoharmonize/
├── server/
│   ├── db.ts
│   ├── geminiService.ts
│   └── harmonizationEngine.ts
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── LayerControlPanel.tsx
│   │   ├── MapViewer.tsx
│   │   ├── HarmonizationStats.tsx
│   │   ├── ConflictInspectorModal.tsx
│   │   ├── DataIngestModal.tsx
│   │   ├── MongoAtlasConfigModal.tsx
│   │   ├── CertificateModal.tsx
│   │   ├── AuditTrailModal.tsx
│   │   └── ConflictList.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── index.html
├── server.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
Prerequisites
Install the following before running the project:
Node.js 18+ (or the version required by your environment)
Bun
A MongoDB Atlas account (optional; the project supports a local persistent fallback mode)
A Gemini API key (optional; heuristic analysis is available as a fallback)
Installation
1. Extract the project
unzip geoharmonize.zip
cd geoharmonize
2. Install dependencies
bun install
3. Configure environment variables
Copy the example environment file:
cp .env.example .env
Configure the available environment variables according to the project setup. Do not commit secrets or private API keys to version control.
4. Start the development server
Use the development script defined in package.json:
bun run dev
If the project does not contain a development script, start it using the appropriate Vite and Express development configuration for your environment.
5. Open the application
The backend is configured to use port 3000. Open the local URL shown in your terminal, commonly:
http://localhost:3000
Environment Configuration
The project supports environment-based configuration. Typical configuration may include:
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
Use the exact variable names supported by the implementation in your environment files. Keep .env private and use .env.example only for safe placeholders.
API Endpoints
Health and Database
Method
Endpoint
Description
GET
/api/health
Returns API health status
GET
/api/db/status
Returns database connection status
POST
/api/db/connect
Connects to MongoDB using a supplied URI
POST
/api/db/reset
Resets the database to sample data
Parcels
Method
Endpoint
Description
GET
/api/parcels
Returns parcels; supports status and search filters
GET
/api/parcels/:ulpin
Returns one parcel by ULPIN
PUT
/api/parcels/:ulpin
Updates parcel information
Conflicts and Harmonization
Method
Endpoint
Description
GET
/api/conflicts
Returns all conflicts
POST
/api/conflicts/:conflictId/ai-explain
Generates AI-assisted conflict analysis
POST
/api/conflicts/:conflictId/resolve
Resolves a selected conflict
POST
/api/harmonize/auto
Runs batch harmonization
Layers, Audit, and Metrics
Method
Endpoint
Description
GET
/api/layers
Returns spatial layer configurations
PUT
/api/layers/:id
Updates a layer configuration
GET
/api/audit-logs
Returns audit log entries
GET
/api/metrics
Returns harmonization summary metrics
Harmonization Workflow
1. Load parcel and spatial-layer data
              │
              ▼
2. Inspect parcel measurements and geometry
              │
              ▼
3. Identify active spatial conflicts
              │
              ▼
4. Review conflict details and AI explanation
              │
              ▼
5. Apply an appropriate harmonization method
              │
              ▼
6. Update parcel geometry and status
              │
              ▼
7. Record the resolution in the audit trail
              │
              ▼
8. Review updated analytics and parcel status
Harmonization Methods
The backend includes methods such as:
SNAP_TO_DRONE
EQUAL_PARTITION
BUFFER_TRUNCATE
AUTO_INTELLIGENT_SNAP
TOPOLOGICAL_CLEANING_DOUGLAS_PEUCKER
These methods are prototype processing strategies. They should be tested against validated geospatial datasets and reviewed by domain experts before production deployment.
Data Model
A parcel record may contain:
Unique Land Parcel Identification Number (ULPIN)
Survey number and subdivision
Village, ward, and district
Owner and tax identifiers
Land-use classification
Deed, surveyed, drone, and harmonized areas
Discrepancy percentage
Confidence score
Polygon geometry
Source layers
CRS information
Harmonization status and method
A conflict record may contain:
Conflict ID and type
Severity and status
Primary and conflicting parcel references
Conflict area and description
Affected layers
Conflict coordinates
AI analysis
Resolution metadata
Detection timestamp
Security and Governance Considerations
Before using GeoHarmonize with real land records, consider implementing:
Role-based access control
Authentication and session management
Encryption of sensitive data
Validation and sanitization of all inputs
Secure MongoDB connection management
API rate limiting
Immutable and verifiable audit logs
Human approval before official boundary changes
CRS validation and geospatial quality checks
Legal review of AI-generated recommendations
Current Prototype Limitations
Sample parcel data is included for demonstration.
The harmonization engine uses simplified prototype geometry operations.
Some AI-generated legal fields may require external legal verification.
Automated confidence scores are not a substitute for a formal accuracy assessment.
Official cadastral updates require appropriate authority, survey validation, and statutory procedures.
Production deployment would require comprehensive testing with real geospatial datasets.
Future Enhancements
Import support for Shapefile, GeoJSON, KML, and GeoPackage formats.
Coordinate reference system transformation and validation.
Integration with high-accuracy DGPS and total-station survey data.
Advanced spatial indexing and geometry validation.
Role-based workflows for surveyors, administrators, and planning authorities.
Human-in-the-loop approval for every legally relevant adjustment.
Versioned parcel boundaries and rollback support.
Tamper-evident audit logs and digital signatures.
Advanced map tools, measurement tools, and spatial querying.
Automated generation of review reports and official workflow documents.
Automated test coverage for geometry and reconciliation functions.
Deployment using containerization and CI/CD pipelines.
Use Cases
Urban land-record modernization
Municipal planning and zoning review
Cadastral data quality improvement
Survey discrepancy investigation
Infrastructure and right-of-way analysis
Land administration decision support
Multi-source geospatial data quality assurance
Contribution Guidelines
Contributions are welcome for improving the prototype.
Fork the repository.
Create a feature branch.
Make focused changes.
Add or update tests where applicable.
Verify the application locally.
Submit a pull request with a clear description.
Example:
git checkout -b feature/improved-boundary-validation
git add .
git commit -m "Improve boundary validation"
git push origin feature/improved-boundary-validation
License
Add an appropriate license before public distribution. If this is an academic or competition prototype, clearly define ownership and permitted reuse terms.
Acknowledgements
GeoHarmonize is designed as a technology prototype for improving the integration, inspection, and harmonization of urban land information through geospatial processing, automation, and AI-assisted analysis.
Project Summary
GeoHarmonize brings together geospatial data, automated boundary processing, AI-assisted analysis, database integration, and auditability into a single platform for urban land-record harmonization.
The long-term goal is to support reliable, transparent, and reviewable land-data workflows while keeping official decisions under appropriate human and institutional oversight.
