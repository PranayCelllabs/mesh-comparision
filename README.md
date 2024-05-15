# Mesh Comparision

A script to compare the mesh and find users with duplicate app and net keys.

**NOTE: Please make sure to add the mesh-data.csv, user-data.csv files to this directory before running the script.**

## Steps

- `readMeshFileAndUpdateOutput(Path_To_Mesh_Csv)`: The script, first reads the mesh data and updates meshOutput array with only the necessary data. (id, appKeys, netKeys)

- `findDuplicateMeshObjects(Mesh_Output)`: Then, it will loop over the meshOutput array and finds the objects with both duplicate app and net keys.

- `readUserFile(User_file_Path)`: Then, it will read the user data and updates userOutput array with only the necessary data. (id, email)

- `updateUserDetailsInMeshOutput()`: This function will update the user details in the meshOutput array, by comparing the ids.

and finally the output is written to `result.json`
