# U-Tube
- A project for learning backend which has all the functionalities and datapoint of youtube. This project is under mentorship of Hitesh Chaudhary, founder of channel : Chai aur code. 
- So make your tea and take the cup and start development. 

## File Structure

1. Root folder (`/`) : It contains pacakge.json, .env, .gitignore, pacakge-lock.json, README.md and folders
2. `src` folder : Main logic part, further it contains following folder:

    1. controllers
    2. db
    3. middlewares
    4. models
    5. routes
    6. utils : It will have utility modules to help us doing task more efficiently and more cleanly. Like making function for executing function asynchronously

## Used technologies and library

1. `nodemon` &nbsp;&nbsp;&nbsp;:&nbsp;For restarting the server after a save.
2. `dotenv`  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: For system environment variables
3. `prettier`&nbsp;&nbsp;: For formatting of code
4. `express` : 
5. `mongoose`:
6. `cookie-parser`:
7. `cors`:
8. `mongoose-aggregate-paginate-v2`:
9. `bcrypt.js` : 
10. `jsonwebtoken` : 

### Generating secret keys for jwt:

To generate a random JWT secret key, you can use a tool like Node.js to create a random string. Here's a simple example:

1. Open your terminal or command prompt.
2. Run the following Node.js script to generate a random string:
```js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
This command uses the crypto module in Node.js to generate a random sequence of 32 bytes and then converts it to a hexadecimal string.