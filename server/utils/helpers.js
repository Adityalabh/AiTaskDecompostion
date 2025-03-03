export const validateRequest = (mainTask) => {
  if (!mainTask) {
    throw new Error("Task description is required");
  }
};

export const parseResponse = (responseText) => {
  return responseText.replace(/```json|```/g, '');
};