package com.sismics.docs.core.model.jpa;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "T_USER_REGISTER_REQUEST")
public class UserRegisterRequest {
    @Id
    @Column(name = "URR_ID_C", length = 36)
    private String id;

    @Column(name = "URR_USERNAME_C", length = 50, nullable = false)
    private String username;

    @Column(name = "URR_PASSWORD_C", length = 100, nullable = false)
    private String password;

    @Column(name = "URR_EMAIL_C", length = 100, nullable = false)
    private String email;

    @Column(name = "URR_STATUS_C", length = 20, nullable = false)
    private String status;

    @Column(name = "URR_REQUEST_TIME_D", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date requestTime;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(Date requestTime) {
        this.requestTime = requestTime;
    }
} 