package com.royalty.backend.auth.mapper;

import com.royalty.backend.auth.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {

    // 🔐 일반 로그인 (username)
    Optional<User> findByUsername(@Param("username") String username);

    Optional<User> findById(@Param("id") Long id);

    // 🔐 소셜 로그인 (provider + provider_id)
    Optional<User> findByProviderId(
            @Param("provider") String provider,
            @Param("providerId") String providerId
    );

    int existsByUsername(@Param("username") String username);

    void save(User user);

    void deleteById(@Param("id") Long id);
    Optional<User> findByEmail(String email);
    List<User> findAllByEmail(String email);
    int existsByEmail(String email);
    
    void updatePassword(User user);
    
    // fcm토큰쪽
    void saveFcmToken(
    	    @Param("userId") Long userId,
    	    @Param("token") String token
    	);

    	List<String> findFcmTokensByUserId(Long userId);
    

    
    
}
