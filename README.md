# Cloud Drive Sharing Manager

**Background.** Securely implementing access control and correctly managing access control policy (a.k.a.sharing or permissions) are challenging. For example, broken access control is the top web application vulnerability in OWASP’s list of the Top 10 web application vulnerabilities in 2021. The 2018 Cloud Security Report, a survey of over 570 IT and security professionals published by Cybersecurity Insiders and Crowd Research Partners, found that “Misconfiguration of cloud platforms jumped to the number one spot in this year’s survey as the single biggest threat to cloud security (62%). This is followed by unauthorized access through misuse of employee credentials and improper access controls (55%), and insecure interfaces / APIs (50%).”

Some popular cloud drives offer only very basic functionality for managing sharing. For example, here are a few ways in which Google Drive falls short.

- Direct and inherited permissions. Sharing a folder automatically shares everything in it; we say that items in a folder inherit permissions from the folder. Knowing which permissions are inherited and which are directly assigned is important, because moving a file between folders changes inherited permissions but not directly assigned permissions. Google Drive’s UI lists the two kinds of permissions together, with no indication of which is which.
- Checking consistency of permissions. Google Drive shows the permissions of at most one file at a time. This makes it difficult to check whether files have consistent permissions. For example, suppose you want to check that all of the files in a folder have the same permissions; perhaps because you were changing the permissions and aren’t sure whether you changed all of them correctly, or because you shared the folder with someone, let them change the permissions (the gear icon in the Sharing window lets you select whether Editors can change the file’s permissions), and you want to check their changes. The only way to do this is to click on each file, one at a time, and look at the permissions.
- Security auditing. Suppose you are working on a project and want to be sure that the files have only been shared with approved users; for example, you received the files under an NDA that allows access only to project members. Google Drive does not provide any easy way to check this. Note that accidental violations could occur in various ways, e.g., you or another project member mistype an email address when sharing an item, or you or another project member share a folder without realizing that a sensitive file is in a subfolder. Google Drive does not provide any support for expressing or checking such policies.
- Checking group permissions. Sharing a file with a Google Group shares it with all members of the group. This is convenient but can lead to unintended permissions, and Google Drive does not provide an easy way to check the resulting permissions. For example, suppose you want to see a list of all files shared with Snoopy, to check that nothing was shared with him inappropriately. According to the Google Drive documentation, a “sharedwith:” query will “Find documents a specific account has access to.” But “sharedwith:Snoopy” does not return files shared with groups whose members include Snoopy.

**Goal.** The goal of this project is to create a user-friendly web interface with a rich set of features to manage sharing on Google Drive and Microsoft OneDrive. The system should be extensible: adding support for additional cloud drive services should be relatively easy. The system should be able to fetch metadata for all files accessible to the current user, or a specified subset of those files, and save the result in an internal database, for flexible and efficient analysis.

# Tech Stack & Features
- React
- Node.js
- Express.js
- MongoDB


# GETTING INTO THE PROJECT
This system can be extended to two cloud drive services, Google Cloud Drive and Microsoft OneDrive.
   
### Main Login Page
<center><img src = "https://user-images.githubusercontent.com/78739450/194716972-8448549f-ec45-4ae0-b359-28d198063134.png" width = "60%" height = "60%"/></center>

_This page is the first page of our website for login, and users can see the app logo and the login button for each of the cloud drive services (i.e., Google Cloud Drive and Microsoft OneDrive)._
   
### User Profile
<center><img src = "https://user-images.githubusercontent.com/78739450/194717092-a4c90817-86ce-414f-9030-5bb697cd0d17.png" width = "60%" height = "60%"/></center>

_Once a user successfully logs in to a cloud drive service, it will redirect to the user's profile where the user can see their information.
In the User Profile page, the user can edit their account information and manage their access control requirements (i.e., add requirements or edit previous requirements).
Additionally, users can view their file-sharing and group-membership snapshots and search query history._   
   
### Violation
<center><img src = "https://user-images.githubusercontent.com/78739450/194717029-fbca99bd-c788-4267-b5a8-438daf4da7df.png" width = "60%" height = "60%"/></center>

_When the user clicks on the "Check requirements" button, it will check the current snapshot against the user's access control requirements, and if there exist violations, the user will be alerted of the violations and will be able to see all occurring violations._
   
### Manage Requirements
<center><img src = "https://user-images.githubusercontent.com/78739450/194717028-80d2a398-c62b-437e-97e2-a3f5f7efb237.png" width = "60%" height = "60%"/></center>

_When the user clicks the "Add" or "Edit" button for the requirements, this pop-up page will be displayed, and they can type the requirement name and make requirement using query and adding access control._    
   
### Home page
<center><img src = "https://user-images.githubusercontent.com/78739450/194717026-a06f6a49-0b5b-4743-8141-29fcee9169c2.png" width = "60%" height = "60%"/></center>

_This is the main page of the cloud drive sharing manager. By default, users can see all files within the current snapshot, and can select the cloud drive service they will use in the sidebar._
   
### Search Bar
<center><img src = "https://user-images.githubusercontent.com/78739450/194717025-7621ebe4-f673-475b-a7fb-a4c00dd4e079.png" width = "60%" height = "60%"/></center>

_When the user clicks the search bar, the user can view their search query history with the dropdown box, and can select and edit an existing query easily by clicking on the desired query._   
   
### Query Builder
<center><img src = "https://user-images.githubusercontent.com/78739450/194717021-6e1a8fea-cdfb-4513-8667-09e333b9b5c4.png" width = "60%" height = "60%"/></center>

_When the user clicks the little icon at the end of the search bar, the query builder UI will be shown, and the user can construct the search query more easily using this._   
   
### Create Snapshot
<center><img src = "https://user-images.githubusercontent.com/78739450/194720332-6f24cbdd-e6ba-47a5-86b2-4820bcdb3572.PNG" width = "60%" height = "60%"/></center>

_When the user clicks the camera icon, the pop-up for creating a snapshot will appear, and the user can select either to create a file-sharing snapshot or group-membership snapshot.
They can create a name for the snapshot, and if they select the group-membership snapshot, they can find the group and add it in this snapshot.
   
### Edit Snapshot
<center><img src = "https://user-images.githubusercontent.com/78739450/194717020-01514b33-6413-4061-b4f8-d34592972147.png" width = "60%" height = "60%"/></center>

_To change the snapshot, if the user clicks the E icon next to the camera icon, they can see a dropdown box consisting of all the user's snapshots and select a snapshot to use._   
   
### Folder Information
<center><img src = "https://user-images.githubusercontent.com/78739450/194717018-568fb92c-8eee-4842-b968-d7648077aa29.png" width = "60%" height = "60%"/></center>

_To see file metadata, the user can click the file or folder once, and a right sidebar will be shown to the user.
It will include access information and sharing option. 
And they can also update or add a user account in this page._   
   
### Update Sharing
<center><img src = "https://user-images.githubusercontent.com/78739450/194717017-43e802b8-f387-4695-b800-240f083e9cd1.png" width = "60%" height = "60%"/></center>

_To update sharing information for multiple files at once, the user can select multiple files in the main screen, and click "Change sharing"._   


<center><img src = "https://user-images.githubusercontent.com/78739450/194717016-7c4fa81b-5b50-4c85-9838-0061946a486e.png" width = "60%" height = "60%"/></center>

_And it will lead to this pop-up that can change the sharing settings at once.
Users can view, add, and update the users' access control requirements, and can also add group accounts in the add permission section._   
   
### Analyze Sharing
<center><img src = "https://user-images.githubusercontent.com/78739450/194717015-1cec5f4d-205a-4445-a5a7-8bc472e895e6.png" width = "60%" height = "60%"/></center>

_This page shows the result of any sharing analysis performed on the snapshot (or a selected subset). The user can go through the option in the left side bar._



   

### Analyze Sharing Changes
<center><img src = "https://user-images.githubusercontent.com/78739450/194717011-ba08230a-22e6-4fa3-9ab5-48ab664562a1.png" width = "60%" height = "60%"/></center>

_When user clicks "Sharing Changes", the pop-up will be shown to the user to compare between two snapshots. User can select two snapshots in the right sidebar, and it will show the updated information between two snapshots._   
   
      
      
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
