// Two ways to implent this function, the function will take a function as an argument and we need to execute it asynchronously.


// Way-1
/**
 * Wrapper function to execute another function
 * @param {*} requestHandler: Function to execute asynchrounously
 * @returns function after executing 
 */
const asyncHandler = (requestHandler) => {
    // Another function
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            res.status(error.code || 500).json({
                success: false,
                message: error.message
            })
        }
    }
}


// Way-2 , Using promises

/**
 * 
 * @param {*} requestHandler : function that needs to be executed
 */
// const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise
//             .resolve(requestHandler(req, res, next))
//             .catch((error) => {
//                 next(error);
//             });
//     }
// };

export { asyncHandler };