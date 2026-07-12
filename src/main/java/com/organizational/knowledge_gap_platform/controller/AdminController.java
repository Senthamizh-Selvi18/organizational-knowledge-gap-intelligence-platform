package com.organizational.knowledge_gap_platform.controller;


import com.organizational.knowledge_gap_platform.dto.AssignRoleRequest;
import com.organizational.knowledge_gap_platform.entity.User;
import com.organizational.knowledge_gap_platform.service.AdminService;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminController {


    private final AdminService adminService;


    public AdminController(AdminService adminService){
        this.adminService = adminService;
    }


    @PostMapping("/users/{userId}/roles")
    public User assignRole(
            @PathVariable Long userId,
            @RequestBody AssignRoleRequest request
    ){

        return adminService.assignRole(
                userId,
                request.getRoleId()
        );

    }

}