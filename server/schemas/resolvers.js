const { UserInputError, AuthenticationError } = require("apollo-server-errors")
const { User, Category, Tutorial, Room, Tag, Step, Rating } = require("../models");
const { findOneAndUpdate } = require("../models/Category");

const resolvers = {
    Query: {
        user: async (_, { username }) => {
            // TODO add awaits to all of these that are missing it
            return User.findOne({ username: username }).populate('tutorials')
        },
        users: async () => {
            return await User.find();
        },
        categories: async () => {
            return Category.findAll();
        },
        tutorials: async (_, { title, tagIDs, categoryIDs }) => {
            const args = title ? { title } : {};
            return Tutorial.find(args).populate(
                [{
                    path: 'steps',
                    populate: {
                        path: 'comments',
                        populate: {
                            path: 'author'
                        }
                    }
                },
                {
                    path: 'author'
                },
                {
                    path: 'tags'
                },
                {
                    path: 'ratings'
                }]
            );
        },
        tutorial: async (_, { id }) => {
            return Tutorial.findOne({ _id: tagId })
        },
        room: async (_, { id }) => {
            // Mongoose Deep Population
            // https://mongoosejs.com/docs/populate.html#deep-populate
            console.log(id);
            const room = await Room.findById(id)
            .populate({
                path: 'owner',
                populate: {
                    path: 'username'
                }
            })
            .populate({
                path: 'tutorial',
                populate: [{
                    path: 'steps',
                    populate: {
                        path: 'comments',
                        populate: {
                            path: 'author',
                            populate: {
                                path: 'username'
                            }
                        }
                    }
                },
                {
                    path: 'author'
                },
                {
                    path: 'tags'
                },
                {
                    path: 'category'
                }]
            }); 
            // console.log(room.tutorial.steps);
            return room;
        },
    },
    Mutation: {
        addUser: async (_, { args }) => {
            try {
                let res = await User.create({ args });
                return res;
            }
            catch (e) {
                return e.message;
            }
        },
        createTutorial: async (_, { TutorialInput }) => {
            // await to create tags, steps 
            // use object ids from created tags and steps and pass to tutorial creation object 
            console.log('hello')
            return Tutorial.create({ TutorialInput }).populate('user');
        },
        addComment: async (_, { stepId, content }) => {
            // TODO - fix this, this code does not add a comment
            if (user) {
                return Comment.findOneAndUpdate(
                    { _id: ID, author },
                    {
                        $addToSet: {
                            comments: { _id, author, content },
                        },
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );
            }
            throw new AuthenticationError('Must be logged in first');
        },
        deleteComment: async (_, { commentId }, context) => {
            if (context.user) {
                // TODO: Fix this, this does not delete a comment.
                return Comment.findOneAndDelete(
                    { _id: commentId },
                    {
                        $pull: {
                            comments: {
                                _id: commentId,
                                commentAuthor: context.user.username,
                            },
                        },
                    },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in first');
        },
        addRating: async (_, { ratingId }, context) => {
            // TODO: Fix this, this does not add a rating
            if (context.user) {
                return Rating.findOne({ _id });
            }
        },
        deleteRating: async (_, { ratingId }, context) => {
            // Fix this, this does not delete a rating
            if (context.user) {
                return Rating.findOneAndUpdate(
                    { _id: userId },
                    {
                        $pull: {
                            ratings: {
                                _id: ratingId,
                                ratingId: context.user,
                            },
                        },
                    },
                    { new: true }
                );
            }
            throw new AuthenticationError('You need to be logged in first')
        },
        createRoom: async (_parent, { tutorialId }, context) => {
            // TODO: link firebase authentication with server side to check for authentication before room creation.
            console.log(context.user);
            const tutorial = await Tutorial.findById(tutorialId)
            .populate({
                path: 'steps',
                populate: { 
                    path: 'comments',
                    populate: { path: 'author' }
                }
            }).populate({
                path: 'author'
            });

            const dbRoom = await Room.create({
                owner: context.user,
                tutorial: tutorialId
            });

            return {
                _id: dbRoom.id,
                owner: context.user,
                tutorial: tutorial
            }
        },
        connectToRoom: async (_parent, { roomId }, context) => {
            if(context.user) {
                // Add this user to the connected users, then return the resulting room.
                return await findOneAndUpdate(
                    {
                        _id: roomId
                    },
                    {
                        $addToSet: {
                            connectedUsers: context.user.id
                        }
                    },
                    {
                        new: true
                    }
                )
            }
        },
        disconnectFromRoom: async (_parent, { roomId }, context) => {
            if(context.user) {
                return await findOneAndUpdate(
                    {
                        _id: roomId
                    },
                    {
                        $pull: {
                            connectedUsers: context.user._id
                        }
                    },
                    {
                        new: true
                    }
                );
            }
        },
        recordStepFinished: async (_parent, { roomId }, context) => {
            if(context.user) {
                return await findOneAndUpdate(
                    {
                        _id: roomId
                    },
                    {
                        $addToSet: {
                            finishedUsers: context.user.id
                        }
                    },
                    {
                        new: true
                    }
                );
            }
        },
        recordStepNotFinished: async (_parent, { roomId }, context) => {
            if(context.user) {
                return await findOneAndUpdate(
                    {
                        _id: roomId
                    },
                    {
                        $pull: {
                            finishedUsers: context.user.id
                        }
                    },
                    {
                        new: true
                    }
                );
            }
        },
        progressRoom: async (_parent, { roomId }, context) => {
            if(context.user) {
                const room = Room.findById(roomId);
                room.currentStep++;
                room.save();
                return room;
            }
        }
    }
}

module.exports = resolvers;