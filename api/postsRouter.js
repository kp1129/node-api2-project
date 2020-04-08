const express = require('express');
const db = require('../data/db');

const router = express.Router();

// GET
// all posts from database
router.get("/", (req, res) => {
    db.find()
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(500).json({ error: "The posts information could not be retrieved." }))
});

// post with specific id
router.get("/:id", (req, res) => {
    const id = req.params.id;
    db.findById(id)
    .then(post => {
        if(post.length > 0){
            res.status(200).json(post);
        } else if (post.length === 0) {
            res.status(404).json({  message: "The post with the specified ID does not exist." })
        }})
    .catch(error => res.status(500).json({ error: "The post information could not be retrieved." }))
});

// comments for a post with specific id
router.get("/:id/comments", (req, res) => {
    const id = req.params.id;
    // first, check to see if the post with this id exists
    db.findById(id)
    .then(post => {
        if(post.length > 0){
            // ok so post exists, now grab the comments
            db.findPostComments(id)
            .then(comments => res.status(400).json(comments))
            .catch(err => res.status(500).json({ error: "The comments information could not be retrieved." }))
        } else if (post.length === 0){
            res.status(404).json({ message: "The post with the specified ID does not exist." })
        }
    })
    .catch(err => res.status(500).json({ error: "The comments information could not be retrieved." }))
});

// DELETE
// post with a specific id
router.delete("/:id", (req, res) => {
    const id = req.params.id;
    // do we even have a post with this id?
   db.findById(id)
   .then(post => {
       if(post.length > 0){
        //    yes we have this post id, now remove it from db
        db.remove(id)
        .then(response => res.status(200).json(post))
        .catch(err => res.status(500).json({ error: "The post could not be removed" }))
       } else if (post.length === 0){
        //    this post id does not exist
        res.status(404).json({ message: "The post with the specified ID does not exist."})
       }
   })
   .catch(err => res.status(500).json({ error: "The post could not be removed" }))        
});

// POST
// one new post
router.post("/", (req, res) => {
    const newPost = req.body;
    if(!newPost.title || !newPost.contents){
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
    } else {
        db.insert(newPost)
         .then(response => res.status(201).json(newPost))
         .catch(err => res.status(500).json({ error: "There was an error while saving the post to the database" }))
    }    
})

// a new comment for the post with the specified id
router.post("/:id/comments", (req, res) => {
    const id = req.params.id;
    // make sure this post id exists
    db.findById(id)
    .then(post => {
        if(post.length > 0){
            // great
            // post exists, let's save the comment
            const newComment = req.body;
            // make sure all required properties are there
            if(!newComment.text){
                res.status(400).json({ errorMessage: "Please provide text for the comment." })
            } else {        
                db.insertComment(newComment)
                .then(response => res.status(201).json(newComment))
                .catch(err => res.status(500).json({ error: "There was an error while saving the comment to the database" }))
            }
        } else if (post.length === 0){
            // not great
            // no post with this id :'(
            res.status(404).json({ message: "The post with the specified ID does not exist."})
        }
    })
    .catch(err => res.status(500).json({ error: "There was an error while saving the comment to the database" }))
})

// PUT
// the post with the specified id 
router.put("/:id", (req, res) => {
    const id = req.params.id;
    // make sure we have a post with this id
    db.findById(id)
    .then(post => {
        if(post.length > 0){
            // post exists! next precation:
            // make sure the updated post has all the required properties
            const updatedPost = req.body;
            if(!updatedPost.title || !updatedPost.contents){
                res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
            } else {
                // finally. Update the post!
                db.update(id, updatedPost)
                .then(response => {
                    if(response === 1){
                        res.status(200).json(updatedPost)
                    } else {
                        res.status(500).json({ error: "The post information could not be modified." })
                    }
                })
                .catch(err => res.status(500).json({ error: "The post information could not be modified." }))
            }
        } else if(post.length === 0){
            // this post id does not exist
            res.status(404).json({ message: "The post with the specified ID does not exist."})
        }
    })
    .catch(err => res.status(500).json({ error: "The post information could not be modified." }))
})

module.exports = router;