export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    version: "1.0.0",
    description: "A scalable REST API with JWT Authentication and Role-Based Access Control",
  },
  servers: [{ url: "/api", description: "API Base Path" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          username: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "integer" },
          user_id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["pending", "in_progress", "done"] },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } },
        },
      },
    },
  },
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Tasks", description: "Task management (JWT required)" },
    { name: "Admin", description: "Admin-only endpoints" },
    { name: "Health", description: "Health check" },
  ],
  paths: {
    "/healthz": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } } },
        },
      },
    },
    "/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: { type: "string" },
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User registered successfully" },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        token: { type: "string" },
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/v1/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Get all tasks for logged-in user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "List of tasks",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { type: "array", items: { $ref: "#/components/schemas/Task" } } } } } },
          },
          "401": { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a new task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["pending", "in_progress", "done"] },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Task created" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/v1/tasks/{id}": {
      put: {
        tags: ["Tasks"],
        summary: "Update a task",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["pending", "in_progress", "done"] },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Task updated" },
          "404": { description: "Task not found" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "Task deleted" },
          "404": { description: "Task not found" },
        },
      },
    },
    "/v1/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of users" },
          "401": { description: "Unauthorized" },
          "403": { description: "Forbidden - Admin only" },
        },
      },
    },
    "/v1/admin/users/{id}": {
      delete: {
        tags: ["Admin"],
        summary: "Delete a user (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: {
          "200": { description: "User deleted" },
          "404": { description: "User not found" },
        },
      },
    },
    "/v1/admin/tasks": {
      get: {
        tags: ["Admin"],
        summary: "List all tasks across all users (admin only)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "List of all tasks" },
          "403": { description: "Forbidden - Admin only" },
        },
      },
    },
  },
};
