function validateCreateTaskUnderVote(data) {
  const {
    createdAt,
    description,
    dueDate,
    startDate,
    priority,
    title,
    adminEmail,
  } = data;

  // ---------- simple field checks ----------
  if (!adminEmail.includes("@")) {
    return { valid: false, message: "adminEmail must be a valid email" };
  }

  if (typeof description !== "string" || description.trim() === "") {
    return { valid: false, message: "description must be a non-empty string" };
  }

  if (typeof title !== "string" || title.trim() === "") {
    return { valid: false, message: "title must be a non-empty string" };
  }

  if (priority === "" || priority === null) {
    return { valid: false, message: "priority is required" };
  }

  // ---------- date checks ----------
  if (isNaN(Date.parse(startDate))) {
    return { valid: false, message: "startDate must be a valid ISO date" };
  }
  if (isNaN(Date.parse(dueDate))) {
    return { valid: false, message: "dueDate must be a valid ISO date" };
  }
  if (isNaN(Date.parse(createdAt))) {
    return { valid: false, message: "createdAt must be a valid ISO date" };
  }

  return { valid: true };
}
module.exports = { validateCreateTaskUnderVote };
