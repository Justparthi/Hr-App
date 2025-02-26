CREATE TABLE otp_requests (
    id NUMBER PRIMARY KEY,                 
    mobile_number VARCHAR2(15) NOT NULL,
    otp VARCHAR2(6) NOT NULL,
    otp_expiration TIMESTAMP(6) NOT NULL,   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
