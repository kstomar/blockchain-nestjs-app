# Price Service - README

## Overview
This service manages cryptocurrency prices and alerts for Ethereum (ETH), Polygon (MATIC), and Bitcoin (BTC). It periodically fetches price data, sends email notifications for significant price changes, and allows users to set alerts for specific price thresholds.

## Features
- Fetch current prices for ETH, MATIC, and BTC.
- Detect and alert on price increases exceeding 3% within an hour.
- Set and manage user alerts for specific price targets.
- Calculate swap rates and fees for ETH to BTC conversions.

## Endpoints

### Price Operations
#### Fetch Prices
Automatically executed every 5 minutes to update price data and process alerts.

### Alerts Operations
#### Set Alert
- **Method**: `POST`
- **Path**: `/alerts`
- **Body**:
  ```json
  {
    "chain": "ethereum",
    "targetPrice": 2000,
    "email": "user@example.com"
  }
  ```
- **Description**: Creates an alert for the specified chain and price target.

#### Check Alerts
Automatically checks if any active alerts meet their conditions during periodic price updates.

### Swap Rate Calculation
#### Get Swap Rate
- **Method**: `POST`
- **Path**: `/swap`
- **Body**:
  ```json
  {
    "ethAmount": 2
  }
  ```
- **Response**:
  ```json
  {
    "btcAmount": 0.1,
    "feeInEth": 0.06,
    "feeInUsd": 120
  }
  ```
- **Description**: Calculates the amount of BTC received for a given ETH amount, considering a 3% fee.

## Cron Jobs
- **Price Fetching**: Runs every 5 minutes to update prices and check alerts.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/price-service.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```env
   DATABASE_HOST=postgres
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=yourpassword
   DATABASE_NAME=blockchain_db
   MORALIS_API_KEY=your-moralis-api-key
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   ```

4. Run the application:
   ```bash
   docker-compose up --build
   ```

## Testing
1. Run unit tests:
   ```bash
   docker-compose exec app npm run test -- --coverage
   ```


## Technology Stack
- **Framework**: NestJS
- **Database**: TypeORM (PostgreSQL)
- **Dependencies**:
  - `axios` for API requests
  - `nodemailer` for email notifications
  - `node-cron` for scheduling tasks
