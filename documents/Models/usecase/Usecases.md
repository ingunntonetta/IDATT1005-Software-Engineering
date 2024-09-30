# USECASE 1 Generate Shoppinglist based on Recipe

### Goal: 
To allow the user to generate a shoppinglist based on the ingredients needed for a selected recipe, which the user does not currently have. 

### Actor:
User

### Trigger:
The user wishes to generate a shoppinglist for a recipe

### Preconditions
- The user is already logged in

### Main Success Scenario:
1. **Navigate to recipes**
- The system displays the home page
- The user navigates to the recipes tab, using the "cooking pot" icon
- The system fetches all recipes

2. **Find Recipe**
- The user inputs the desired recipe name in the search bar, and initates a search
- The system displays matching recipes
- The user selects the desired recipe for more details

3. **Generate Shoppinglist**
- The user clicks "generate shoppinglist"
- The system creates a shopping list, containing the items not present in the inventory, and redirects the user to the newly created page
- The user verifes that the list contains the correct items

### Alternative flows:
**1a. Error fetching recipes**
> There is an error in the system causing it to be unable to fetch the requested recipes

**2a. No matching recipes**
> There are no recipes matching the searchterm, and the system notifies the user that they should try a different search criteria

**3a. No missing items**
> All ingredients for the recipe are already registered in the users inventory, and no shoppinglist is needed. 



# USECASE 2 Create Shoppinglist

### Goal: 
To allow the user to create a shoppinglist for their shopping journeys

### Actor:
User

### Trigger:
The user wishes to create a shoppinglist for an upcomming trip

### Preconditions
- The user is already logged in

### Main Success Scenario:
1. **Navigate to shoppinglist**
- The system displays the home page
- The user navigates to the shoppinglist tab, using the "shoppinglist" icon
- The system fetches all shoppinglist for the user

2. **Enter title and description**
- The user clicks the "plus" button, indicating they desire to create a new list
- The system displays a modal, asking for a title
- The user enters a title
- The system displays a modal, asking for a description
- The user enters the desired description

3. **Generate Shoppinglist**
- The user clicks "create"
- The system creates an empty shopping list and redirect the user to its page

4. **Add items to the shoppinglist**
- The user clicks "add items" 
- The system shows a list of items
- The user selects one, and clicks 'add'
- The system adds the item to the list

### Alternative flows:
**1a. Error fetching recipes**
> There is an error in the system causing it to be unable to fetch the requested shoppinglists

**2a. The user cancels the creation process**
> When entering either Title or Description, the user can at any time cancel the process. 
 
**3a. Item does not exist**
> If the users searches for an item that does not exists a create item button will appear
> The user clicks this button and the system prompts the user for an ingredient name
> The user enters the name of the desired item and clicks create
> The system creates the item, and then adds it to the shoppinglist


# USECASE 3 Register Account

### Goal: 
Register an account to get access to the application

### Actor:
User

### Trigger:
The user wishes to use the application, but does not yet have an account 

### Preconditions
- The user does not yet have an account

### Main Success Scenario A:
1. **Navigate to Oauth**
- The system displays the login page
- The user navigaes to Oath login by pressing "log in with google"
- The system redirects the to googles services

2. **Authenticate credentials**
- Google prompts the user for credentials
- The user enters credentials and clicks login
- Google authenticates the credentials and redirects the user back to the application

### Alternative flows:
**1a. Error loding google servcies**
> There is an error connecting the user to the google authentication services

**2a. Invalid credentials**
> The credentials are not authenticated by the google services
> The google services prompts the user to "try again"
> The user again inputs the credentials: (correctly this time)
> Google authenticates the credentials and redirects the user to the application
 


### Main Success Scenario B:
1. **Navigate to custom registration**
- The system displays the login page
- The user navigates to the registation page by pressing "register"
- The system redirects the user to the registration page

2. **Enter credentials**
- The system prompts the user for credentials
- The user enters the credentials 
- The system validates the credentials
- The user clicks "register"
- The system creates an account and redirect the home page


### Alternative flows:
**1a. Error fetching recipes**
> There is an error in the system causing it to be unable to fetch the requested shoppinglists

**2a. The user cancels the creation process**
> When entering either Title or Description, the user can at any time cancel the process. 
 
**3a. Item does not exist**
> If the users searches for an item that does not exists a create item button will appear
> The user clicks this button and the system prompts the user for an ingredient name
> the user enters the name of the desired item and clicks create
> the system creates the item, and then adds it to the shoppinglist


# USECASE 4 Login

### Goal: 
To allow the user to login to the sytem

### Actor:
User

### Trigger:
The user wishes to access the system

### Preconditions
- The user has an account

### Main Success Scenario:
1. **Enter username and password**
- The system displays the login page
- The user enters the username and password

2. **Login**
- The user clicks the login in button, and gets sent to the homepage by the system

### Alternative flows:
**1a. Error wrong username or password**
> There is an error in the data the user entered causing the system to throw an error
> The user gets notified of this error and corrects the login information
> The user gets logged in



# USECASE 5 Create Recipe

### Goal: 
To allow the user to create a recipe for future cooking adventures

### Actor:
User

### Trigger:
The user wishes to create a recipe for an upcomming party

### Preconditions
- The user is already logged in

### Main Success Scenario:
1. **Navigate to Recipes**
- The system displays the home page
- The user navigates to the Recipes tab, using the "Cooking pot" icon
- The system fetches all recipes for the user

2. **Enter the necessary data**
- The user clicks the "plus" button, indicating they desire to create a new recipe
- The system displays a new page for creating the recipe, asking for the necessary data for creation
- The user enter a title, description, the time it takes, cost, description, the necessary steps and an imageURL
- The user adds all the items with their respective amount through the item selector

3. **Generate Recipe**
- The user clicks "create"
- The system creates the desired recipe, redirects the user to its page and displays a toast confirming the creation

### Alternative flows:
**1a. Error fetching recipes**
> There is an error in the system causing it to be unable to fetch the requested recipes

**2a. The user cancels the creation process**
> When entering the necessary data for a recipe, the user can at any time cancel the process. 
 
**3a. Item does not exist**
> If the users searches for an item that does not exists a create item button will appear
> The user clicks this button and the system prompts the user for an ingredient name
> The user enters the name of the desired item and clicks create
> The system creates the item
> The user enters the amount of the item
> The user adds the item to the ingredients


# USECASE 6 Cook a Recipe

### Goal: 
To allow the user to cook a recipe

### Actor:
User

### Trigger:
The user wishes to cook a recipe for dinner

### Preconditions
- The user is already logged in

### Main Success Scenario:
1. **Navigate to Recipes**
- The system displays the home page
- The user navigates to the recipes tab, using the "cooking pot" icon
- The system fetches all recipes for the user

2. **Click the recipe**
- The user navigates to the recipe to make, indicating the desire to cook the recipe

3. **Cook the Recipe**
- The user clicks "Create Recipe"
- The user clicks confirm in the popup
- The items that match the ingredients are deleted and the system navigates to the fridge

### Alternative flows:
**1a. Error fetching recipes**
> There is an error in the system causing it to be unable to fetch the requested recipes

**2a. The user cancels the creation process**
> When in the recipe page, the user can at any time exit the the page, or cancel in the popup 

**2b. The user searches for a recipe**
> When looking at recipes the user decides to search for a recipe.
> The user clicks the search bar and enters the keyword
> The user clicks the correct recipe

# USECASE 7 Join and leave Household

### Goal: 
To allow the user to join or leave a household

### Actor:
User

### Trigger:
The user wishes join or leave a friends household

### Preconditions
- The user is already logged i
- Scenario A: The user is not in the household it will be joining
- Scenario B: The user is not in a private houshold

### Main Success Scenario A:
1. **Navigate to Household**
- The system displays the home page
- The user navigates to the profile page, using the profile avatar
- The user clicks the Household item in the list

2. **Join the Household**
- The user clicks "Join new household", indicating the desire to join another household
- The user pastes in the join code and clicks confirm in the popup
- The system dispays the new household page with a sucess toast

3. **Leave the Household**
- The user clicks "Leave household", indicating the desire to leave the household
- The user clicks confirm in the popup
- The system displays the new private households

### Alternative flows:
**1a. Error joining household**
> There is an error in the system, or an expired join code, causing it to be unable to complete the request

**1b. Error leaving household**
> There is an error in the system causing it to be unable to complete the request

**2a. The user cancels the process**
> When in the join household page, the user can at any time exit the the page, or cancel the confirmation popup 


# USECASE 8 Complete/archive Shoppinglist

### Goal: 
To allow the user to complete a shoppinglist and automatically load the purchased items into the fridge

### Actor:
User

### Trigger:
The user wishes to comlete a shoppinglist and

### Preconditions
- The user is already logged in
- The user has a shoppinglist where the purchased items are checked

### Main Success Scenario:
1. **Navigate to the shoppinglist**
- The system displays the home page
- The user navigates to the shoppinglist tab, using the "shoppinglist" icon
- The system fetches all shoppinglist for the user

2. **Enter the shoppinglist**
- The user finds the correct shopping list and clicks it
- The user marks the items that have been purchased, if not already marked

3. **Complete Shoppinglist**
- The user clicks "Archive"
- The system archives the shopping list and moves all marked items from the shoppinglist into the fridge, if they are not already there
- redirect the user back to the active shoppinglist page

### Alternative flows:
**1a. Error fetching shoppinglists**
> There is an error in the system causing it to be unable to fetch the requested shoppinglists

**2a. The user cancels the process**
> The user can at any time cancel the process or choose to exit the shoppi. 
 
**3a. All items already exist in the fridge**
> No new items are added


# USECASE 9 Add and remove items from fridge

### Goal: 
To allow the user administer the fridge

### Actor:
User

### Trigger:
The user wishes add a new item or remove to the fridge

### Preconditions
- The user is already logged i
- Scenario A: The item is not already in the fridge
- Scenario B: The fridge contains at least one item

### Main Success Scenario A:
1. **Navigate to Fridge**
- The system displays the home page
- The user navigates to the fridge, using the "Fridge" icon

3. **Add an item**
- The user clicks "Add new item...", indicating the desire to update the fridge
- The user searches and selcts the correct item
- The user adds the correct item using the "Add" button

### Main Success Scenario B:
1. **Navigate to Fridge**
- The system displays the home page
- The user navigates to the fridge, using the "Fridge" icon

3. **Remove an item**
- The user marks one or more items, indicating the desire to update the fridge
- The user removes the marked item(s) using the "Remove" button

### Alternative flows:
**1. Error fetching items in fridge**
> There is an error in the system causing it to be unable to fetch the requested items

**2. The user cancels the process**
> When in the frige page, the user can at any time enter another page, or cancel the confirmation popup


