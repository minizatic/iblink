var Ideas = new Meteor.Collection("Ideas");

Meteor.publish("Ideas", function(){
	return Ideas.find({});
});

var chats = new Meteor.Collection("chats");

Meteor.publish("chats", function(){
	return chats.find({});
});

Meteor.publish("userStatus", function(){
	return Meteor.users.find({"profile.online": true});
});