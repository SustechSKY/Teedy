package com.sismics.docs.core.dao;

import com.sismics.docs.core.model.jpa.UserRegisterRequest;
import com.sismics.util.context.ThreadLocalContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import java.util.List;

/**
 * User registration request DAO.
 */
public class UserRegisterRequestDao {
    /**
     * Creates a new registration request.
     *
     * @param request Registration request
     * @return New registration request
     */
    public UserRegisterRequest create(UserRegisterRequest request) {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        em.persist(request);
        return request;
    }

    /**
     * Updates a registration request.
     *
     * @param request Registration request
     * @return Updated registration request
     */
    public UserRegisterRequest update(UserRegisterRequest request) {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        return em.merge(request);
    }

    /**
     * Gets a registration request by its ID.
     *
     * @param id Registration request ID
     * @return Registration request
     */
    public UserRegisterRequest getById(String id) {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        try {
            return em.find(UserRegisterRequest.class, id);
        } catch (NoResultException e) {
            return null;
        }
    }

    /**
     * Gets all pending registration requests.
     *
     * @return List of pending registration requests
     */
    @SuppressWarnings("unchecked")
    public List<UserRegisterRequest> findPending() {
        EntityManager em = ThreadLocalContext.get().getEntityManager();
        Query q = em.createQuery("select r from UserRegisterRequest r where r.status = :status order by r.requestTime");
        q.setParameter("status", "PENDING");
        return q.getResultList();
    }
} 