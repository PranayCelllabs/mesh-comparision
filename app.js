import csv from "csvtojson";
import fs from "fs";

const meshFilePath = "./mesh-data.csv";
const userFilePath = "./user-data.csv";
const meshOutput = [];
const userOutput = [];

let duplicateUsers = [];

await readMeshFileAndUpdateOutput(meshFilePath);

findDuplicateMeshObjects(meshOutput);

await readUserFile(userFilePath);

updateUserDetailsInMeshOutput();

fs.writeFileSync("./result.json", JSON.stringify(duplicateUsers));
console.log("Output written to result.json");

async function readMeshFileAndUpdateOutput(path) {
  const array = await csv().fromFile(path);

  array.forEach((item) => {
    const result = {};
    result.id = item.id;
    if (item.meshNetwork !== "") {
      const parsedNetwork = JSON.parse(item.meshNetwork);
      const appKeys = parsedNetwork.appKeys.L;
      result.appKeys = appKeys.map((appKey) => appKey.M.key.S);
      const netKeys = parsedNetwork.netKeys.L;
      result.netKeys = netKeys.map((netKey) => netKey.M.key.S);
    } else {
      result.appKeys = null;
      result.netKeys = null;
    }
    meshOutput.push(result);
  });
}

function findDuplicateMeshObjects(array) {
  for (let i = 0; i < array.length; i++) {
    const duplicates = [];
    for (let j = i + 1; j < array.length; j++) {
      if (
        array[i].appKeys !== null &&
        array[j].appKeys !== null &&
        compareAppKeysAndNetKeys(array[i], array[j])
      ) {
        duplicates.push(array[j].id);
      }
    }

    const userExists = duplicateUsers.find((user) =>
      user.usersWithSameData.includes(array[i].id)
    );

    if (!userExists && duplicates.length > 0) {
      const object = {
        mainUser: array[i].id,
        usersWithSameData: duplicates,
        appKeys: array[i].appKeys,
        netKeys: array[i].netKeys,
      };
      duplicateUsers.push(object);
    }
  }
}

function compareAppKeysAndNetKeys(user1, user2) {
  const appKeys1String = JSON.stringify(user1.appKeys.sort());
  const appKeys2String = JSON.stringify(user2.appKeys.sort());
  const netKeys1String = JSON.stringify(user1.netKeys.sort());
  const netKeys2String = JSON.stringify(user2.netKeys.sort());

  let response = false;
  if (appKeys1String === appKeys2String && netKeys1String === netKeys2String) {
    response = true;
  }
  return response;
}

async function readUserFile(path) {
  const array = await csv().fromFile(path);
  array.forEach((item) => {
    const result = {};
    result.id = item.id;
    if (item.value !== "") {
      const parsedUser = JSON.parse(item.value);
      const email = parsedUser.smarterhomeUser.M.email.S;
      result.email = email;
    }
    userOutput.push(result);
  });
}

function updateUserDetailsInMeshOutput() {
  duplicateUsers = duplicateUsers.map((item) => {
    item.mainUser = findAndUpdateUserData(item.mainUser);
    item.usersWithSameData = item.usersWithSameData.map(findAndUpdateUserData);
    return item;
  });
}

function findAndUpdateUserData(value) {
  const userFound = userOutput.find((user) => user.id === value);
  if (userFound) {
    return {
      id: userFound.id,
      email: userFound.email,
    };
  } else {
    return value;
  }
}
