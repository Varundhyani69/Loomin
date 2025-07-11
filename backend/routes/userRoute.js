import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { editProfile, followOrUnfollow, getProfile, getSuggestesUser, login, logout, register, deleteUser, getFollowings, searchUsers, getUserBookmarks, getMyProfile } from "../controllers/userController.js";
import uploader from "../middlewares/multer.js";
import { getNotifications, markNotificationsSeen } from "../controllers/notificationController.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/profile/edit', isAuthenticated, uploader.single('profilePhoto'), editProfile);
router.post('/followorunfollow/:id', isAuthenticated, followOrUnfollow);
router.delete('/delete', isAuthenticated, deleteUser);

router.get('/suggested', isAuthenticated, getSuggestesUser);
router.get('/:id/profile', isAuthenticated, getProfile);
router.get('/notifications', isAuthenticated, getNotifications);
router.post('/notifications/mark-seen', isAuthenticated, markNotificationsSeen);
router.get('/followings', isAuthenticated, getFollowings);
router.get('/search', isAuthenticated, searchUsers);
router.get('/bookmarks', isAuthenticated, getUserBookmarks);

router.post('/message/send/:id', isAuthenticated, sendMessage);
router.get('/message/all/:id', isAuthenticated, getMessage);
router.get("/profile", isAuthenticated, getMyProfile);



export default router;
