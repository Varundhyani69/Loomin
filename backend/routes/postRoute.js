import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js"
import uploader from "../middlewares/multer.js";
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getComments, getUserPost, likePost, getFollowingPosts, editCaption, getPostById } from "../controllers/postController.js";
const router = express.Router();

router.post('/addpost', isAuthenticated, uploader.single('image'), addNewPost);
router.get('/all', isAuthenticated, getAllPost);
router.get('/userpost/all', isAuthenticated, getUserPost);
router.post('/:id/like', isAuthenticated, likePost);
router.post('/:id/dislike', isAuthenticated, dislikePost);
router.post('/:id/comment', isAuthenticated, addComment);
router.post('/:id/comment/all', isAuthenticated, getComments);
router.delete('/delete/:id', isAuthenticated, deletePost);
router.post('/:id/bookmark', isAuthenticated, bookmarkPost);
router.get('/following', isAuthenticated, getFollowingPosts);
router.put('/:id/edit-caption', isAuthenticated, editCaption);
router.get('/:id', isAuthenticated, getPostById);

export default router;