export const handleSaveError = (error, data, next) => {
  error.status = 400;
  next();
};

export const runValidatorsAtUpdate = function (next) {
  this.options.runValidators = true;
  console.log("dfs");
  this.options.new = true;
  next();
};
