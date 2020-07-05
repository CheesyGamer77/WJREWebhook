/*
 WJRE Application Webhook
 Written by shaftAndi#0001 & CheesyGamer77#5435
 An apps script to display icoming applicants for the Worst Java Realm
*/

var POST_URL = "https://discordapp.com/api/webhooks/583763401969500161/OsFMihsCoShHwm7VXiqkkUk-BTdsQNOQVRKgPIfYJEVN_ZEBn0zwWwZ1edpud2JMlisc";


function fetchMCUUID(mcname) {
  // this function returns a string containing the uuid supplied from
  // the mojang api. This string may be "INVALID_USERNAME" if the mojang api returns
  // empty json. When this happens, it means that the username is invalid.
  
  var website = ("https://api.mojang.com/users/profiles/minecraft/" + mcname);
  var response = UrlFetchApp.fetch(website);
  
  if(response != "")
  {
    // mojang found data for the username, set the uuid
    var json = JSON.parse(response);
    return json["id"];
  }
  else
  {
    // no data found, the username is not valid
    return "INVALID USERNAME";
  }
}


function getDiscordEmbedFields(formResponse, mcuuid) {
  // this function returns an array containing all the fields
  // for the discord embed to be sent in the java applications channel
  
  var fields = [];
  
  for(var i = 0; i < formResponse.length; i++)
  {
    var question = formResponse[i].getItem().getTitle();
    var answer = formResponse[i].getResponse();
    
    try
    {
      var parts = answer.match(/[\s\S]{1,1024}/g) || [];
    }
    catch (e)
    {
      var parts = answer;
    }
    
    if(answer == "")
    {
      continue;
    }
    
    for(var j = 0; j < parts.length; j++)
    {
      if(j == 0)
      {
        if(i == 1)
        {
          // the current question is "What's your mc ign?"
          fields.push({
            "name": "Applicants UUID",
            "value": mcuuid,
            "inline": false
            });
        }
        if(i == 5) // no, this cannot be an else if statement. if it is, it doesn't include the applicant's discord id in the embed
        {
          // the current question is "submit a photo of one of your best builds!"
          fields.push({
            "name": question,
            "value": "https://drive.google.com/file/d/"+parts[j]+"/view",
            "inline": false
            });
        }
        else
        {
          fields.push({
            "name": question,
            "value": parts[j],
            "inline": false
            });
        }
      }
      else
      {
        fields.push({
          "name": question.concat(" (cont.)"),
          "value": parts[j],
          "inline": false
          });
      }
    }
  }
  
  return fields;
}


function onSubmit(e) {
  // this function is automatically called each time
  // an applicant submits their application via a trigger
  // click "Edit"->"Current project's triggers" for details
  
  var form = FormApp.getActiveForm();
  var allResponses = form.getResponses(); // gets every response within the app as an array of responses
  var latestResponse = allResponses[allResponses.length - 1] // retrieves the most recent application response    
  var response = latestResponse.getItemResponses(); // retrieves all the items from the latest response
  
  // mcname is the user's answer to item 0/question 1 ("What is your minecraft username?")
  // mcuuid is the uuid associated with the user's mc username
  // mcimage is the url for the user's image upload for item 4/question 5 ("Submit a picture of one of your best builds")
  var mcname  = response[0].getResponse().trim();
  var mcuuid = fetchMCUUID(mcname);
  var mcimage = "https://drive.google.com/uc?export=download&id="+response[5].getResponse();
  console.log(mcimage);
  
  //reverseImageSearch(mcimage);
  
  // get the embed fields
  var embedFields = getDiscordEmbedFields(response, mcuuid);
  
  // options is the data that will be sent through discord
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(
      {
        "username": mcname,
        "avatar_url": "https://minotar.net/avatar/" + mcname + ".png",
        "embeds": [{
          "title": "NEW USER HAS REGISTERED!",
          "fields": embedFields,
          "color": 16690944,
          "image": {
            "url": mcimage
            },
          "footer": {
            "text": "https://namemc.com/profile/"+mcuuid+"\nReact with ✅ or ⛔ to determine their acceptance."
            }
        }]
      })
  };
  
  // send the application to the applications channel
  UrlFetchApp.fetch(POST_URL, options);
}
