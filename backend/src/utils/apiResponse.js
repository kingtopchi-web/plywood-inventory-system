class ApiResponse {
  constructor(statusCode, data, message = 'Success', meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  static success(res, data = null, message = 'Operation successful', statusCode = 200, meta = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, meta));
  }

  static created(res, data = null, message = 'Resource created successfully', meta = null) {
    return res.status(201).json(new ApiResponse(201, data, message, meta));
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json(new ApiResponse(404, null, message));
  }
}

module.exports = ApiResponse;
