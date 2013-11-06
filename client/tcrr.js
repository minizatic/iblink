Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY'
});

// Accounts.config({
// 	forbidClientAccountCreation: true
// });

Meteor.startup(function(){
	Hooks.init();
});

Meteor.subscribe("chats");
Meteor.subscribe("Ideas");
Meteor.subscribe("userStatus");
chatCollection = new Meteor.Collection("chats");
Ideas = new Meteor.Collection("Ideas");
Session.set("onHomepage", true);


Hooks.onLoggedIn = function () {
	Session.set("onHomepage", false);
}

Hooks.onLoggedOut = function () {
	Session.set("onHomepage", true);
}

Template.starter.onHomepage = function(){
	return Session.get("onHomepage");
}

Template.main.loggedIn = function(){
	if(Meteor.user()){
		return Meteor.user();
	}else{
		return false;
	}
}

Template.chat.messages = function(){
	return chatCollection.find({}, {sort: {date: -1}, limit: 10}).fetch().reverse();
}

Template.myIdeas.ideas = function(){
	return Ideas.find({author: Meteor.user().username});
}

Template.myIdeas.clickedNew = function(){
	return Session.get("clickedNew");
}

Template.myIdeas.editTitle = function(){
	return Session.get("editTitle");
}

Template.myIdeas.editDescription = function(){
	return Session.get("editDescription");
}

Template.allIdeas.ideas = function(){
	return Ideas.find({author: {$not: Meteor.user().username}});
}

Template.chat.events = {
	'click #postChat': function(e){
		e.preventDefault();
		var msg = $("textarea#message").val();
		if(msg == ""){
			$('.chatError').html(Meteor.render(Template.error({error: "Message may not be blank"})));
		}else{
			chatCollection.insert({
				user: Meteor.user().username,
				message: msg,
				date: new Date()
			});
			$("textarea#message").val("");
		}
	}
}

Template.allIdeas.events = {
	'click .upvote': function(e){
		e.preventDefault();
		var targetId = $(e.target).parent().parent().attr("id");
		Ideas.update({_id: targetId}, {$addToSet: {votes: {voter: Meteor.user().username}}});
	}
}

Template.myIdeas.events = {
	'click a#newIdea': function(e){
		e.preventDefault();
		Session.set("editTitle", undefined);
		Session.set("editDescription", undefined);
		Session.set("editId", undefined);	
		Session.set("editingIdea", false);
		Session.set("clickedNew", true);
	},
	'click #postIdea': function(e){
		e.preventDefault();
		var idea = {}
		idea.title = $('input#inputTitle').val();
		idea.description = $('textarea#description').val();
		if(idea.title == ""){
			$('.ideaError').html(Meteor.render(Template.error({error: "Title may not be blank"})));
		}
		else if(idea.description == ""){
			$('.ideaError').html(Meteor.render(Template.error({error: "Description may not be blank"})));
		}
		else{
			if(Session.equals("editingIdea", true)){
				Ideas.update({_id: Session.get("editId")}, {$set: idea});
			}else{
				idea.author = Meteor.user().username;
				idea.date = new Date();
				idea.votes = [{voter: Meteor.user().username}]
				Ideas.insert(idea);
			}
			clearForm();
		}
	},
	'click #closeNewIdea': function(e){
		e.preventDefault();
		clearForm();
	},
	'click .deleteIdea': function(e){
		e.preventDefault();
		var targetId = $(e.target).parent().parent().attr("id");
		Ideas.remove({_id: targetId});
	},
	'click .editIdea': function(e){
		e.preventDefault();
		var targetId = $(e.target).parent().parent().attr("id");
		var idea = Ideas.findOne({_id: targetId});
		Session.set("editTitle", idea.title);
		Session.set("editDescription", idea.description);
		Session.set("editId", targetId);	
		Session.set("editingIdea", true);
		Session.set("clickedNew", true);
	}
}

var clearForm = function(){
	Session.set("editTitle", undefined);
	Session.set("editDescription", undefined);
	Session.set("editId", undefined);	
	Session.set("editingIdea", false);
	Session.set("clickedNew", false);
}

Template.chat.users = function(){
	return Meteor.users.find({"profile.online": true, username: { $not: Meteor.user().username}});
}