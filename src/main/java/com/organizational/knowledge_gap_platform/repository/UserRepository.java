package com.organizational.knowledge_gap_platform.repository;

import com.organizational.knowledge_gap_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
<<<<<<< HEAD
    Optional<User> findByEmail(String email);
}
=======

    Optional<User> findByEmail(String email);

}
>>>>>>> 55ea7dcb5a196db0b1284f5580271b7280886122
