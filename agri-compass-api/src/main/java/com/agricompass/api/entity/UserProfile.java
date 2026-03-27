package com.agricompass.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    // clerk_user_id is the primary key (matches Clerk's user ID)
    private String id;

    private String username;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String email;

    private String phone;

    private String location;

    @Column(name = "language_preference")
    private String languagePreference;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
