package com.organizational.knowledge_gap_platform.service;

import com.organizational.knowledge_gap_platform.dto.KnowledgeArticleRequestDTO;
import com.organizational.knowledge_gap_platform.dto.KnowledgeArticleResponseDTO;
import com.organizational.knowledge_gap_platform.entity.Employee;
import com.organizational.knowledge_gap_platform.entity.KnowledgeArticle;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.exception.EmployeeNotFoundException;
import com.organizational.knowledge_gap_platform.exception.KnowledgeArticleNotFoundException;
import com.organizational.knowledge_gap_platform.repository.EmployeeRepository;
import com.organizational.knowledge_gap_platform.repository.KnowledgeArticleRepository;
import com.organizational.knowledge_gap_platform.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class KnowledgeArticleServiceImpl implements KnowledgeArticleService {

    private final KnowledgeArticleRepository knowledgeArticleRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public KnowledgeArticleServiceImpl(KnowledgeArticleRepository knowledgeArticleRepository,
                                        EmployeeRepository employeeRepository,
                                        UserRepository userRepository) {
        this.knowledgeArticleRepository = knowledgeArticleRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<KnowledgeArticleResponseDTO> listArticles(String category, String search) {
        List<KnowledgeArticle> articles;

        if (category != null && !category.isBlank()) {
            articles = knowledgeArticleRepository.findByCategoryIgnoreCaseOrderByCreatedAtDesc(category.trim());
        } else if (search != null && !search.isBlank()) {
            articles = knowledgeArticleRepository
                    .findByTitleContainingIgnoreCaseOrTagsContainingIgnoreCaseOrderByCreatedAtDesc(
                            search.trim(), search.trim());
        } else {
            articles = knowledgeArticleRepository.findAllByOrderByCreatedAtDesc();
        }

        return articles.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<KnowledgeArticleResponseDTO> listMyArticles() {
        Employee employee = currentEmployee();
        return knowledgeArticleRepository.findByAuthorOrderByCreatedAtDesc(employee)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public KnowledgeArticleResponseDTO getArticle(Long id) {
        KnowledgeArticle article = knowledgeArticleRepository.findById(id)
                .orElseThrow(() -> new KnowledgeArticleNotFoundException("Article not found with id: " + id));

        article.setViewCount(article.getViewCount() + 1);
        KnowledgeArticle saved = knowledgeArticleRepository.save(article);
        return toDto(saved);
    }

    @Override
    @Transactional
    public KnowledgeArticleResponseDTO createArticle(KnowledgeArticleRequestDTO request) {
        Employee employee = currentEmployee();

        KnowledgeArticle article = new KnowledgeArticle();
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setTags(request.getTags());
        article.setAuthor(employee);
        article.setViewCount(0L);

        KnowledgeArticle saved = knowledgeArticleRepository.save(article);
        return toDto(saved);
    }

    @Override
    @Transactional
    public KnowledgeArticleResponseDTO updateArticle(Long id, KnowledgeArticleRequestDTO request) {
        KnowledgeArticle article = knowledgeArticleRepository.findById(id)
                .orElseThrow(() -> new KnowledgeArticleNotFoundException("Article not found with id: " + id));

        requireAuthorOrAdmin(article);

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setCategory(request.getCategory());
        article.setTags(request.getTags());

        KnowledgeArticle saved = knowledgeArticleRepository.save(article);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        KnowledgeArticle article = knowledgeArticleRepository.findById(id)
                .orElseThrow(() -> new KnowledgeArticleNotFoundException("Article not found with id: " + id));

        requireAuthorOrAdmin(article);

        knowledgeArticleRepository.delete(article);
    }

    private void requireAuthorOrAdmin(KnowledgeArticle article) {
        Employee employee = currentEmployee();

        boolean isAuthor = article.getAuthor().getId().equals(employee.getId());
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equalsIgnoreCase("ROLE_ADMIN"));

        if (!isAuthor && !isAdmin) {
            throw new AccessDeniedException("You can only manage articles you authored.");
        }
    }

    private KnowledgeArticleResponseDTO toDto(KnowledgeArticle article) {
        KnowledgeArticleResponseDTO dto = new KnowledgeArticleResponseDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setContent(article.getContent());
        dto.setCategory(article.getCategory());
        dto.setTags(article.getTags());
        dto.setAuthorId(article.getAuthor().getId());
        dto.setAuthorName(article.getAuthor().getUser() != null ? article.getAuthor().getUser().getName() : null);
        dto.setViewCount(article.getViewCount());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        return dto;
    }

    private Employee currentEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EmployeeNotFoundException("Logged-in user not found."));

        return employeeRepository.findByUser(user)
                .orElseThrow(() -> new EmployeeNotFoundException(
                        "No employee record linked to the logged-in user."));
    }
}
