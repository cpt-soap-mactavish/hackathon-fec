import dbConnect from '@/lib/db';
import User from '@/models/User';
import prisma from '@/lib/prisma';

const DB_TYPE = process.env.DB_TYPE || 'mongodb';

export const userService = {
  async connect() {
    if (DB_TYPE === 'mongodb') {
      await dbConnect();
    }
  },

  async createUser(userData) {
    await this.connect();
    if (DB_TYPE === 'mongodb') {
      const user = await User.create(userData);
      return user.toObject ? user.toObject() : user;
    } else {
      return await prisma.user.create({ data: userData });
    }
  },

  async findUserByEmail(email) {
    await this.connect();
    if (DB_TYPE === 'mongodb') {
      const user = await User.findOne({ email });
      return user; // Mongoose document needed for some legacy checks? No, we should return plain object if possible, but existing code might rely on it. 
      // Actually, for consistency, let's try to return the document for Mongo if we are doing save(), but we are refactoring save() away.
      // So returning the document is fine, but we should treat it as read-only in the calling code.
    } else {
      return await prisma.user.findUnique({ where: { email } });
    }
  },

  async findUserByVerificationToken(token) {
    await this.connect();
    if (DB_TYPE === 'mongodb') {
      return await User.findOne({ 
        verificationToken: token,
        verificationTokenExpiry: { $gt: Date.now() }
      });
    } else {
      return await prisma.user.findFirst({
        where: {
          verificationToken: token,
          verificationTokenExpiry: { gt: new Date() }
        }
      });
    }
  },

  async findUserByResetToken(token) {
    await this.connect();
    if (DB_TYPE === 'mongodb') {
      return await User.findOne({ 
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
      });
    } else {
      return await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }
        }
      });
    }
  },

  async updateUser(identifier, updateData) {
    // identifier can be email or id. Let's assume email for now as it's unique, or pass an object { email: ... } or { id: ... }
    // To be safe, let's accept a query object.
    // Actually, to simplify refactoring, let's define specific update methods or a generic one that takes a query.
    
    await this.connect();
    
    // Helper to normalize query for Prisma
    const getPrismaWhere = (query) => {
      if (query.email) return { email: query.email };
      if (query.id) return { id: query.id };
      // For tokens, we need to find the user first? Or can we updateMany?
      // Prisma update requires a unique identifier usually.
      return null;
    };

    if (DB_TYPE === 'mongodb') {
      // Mongoose findOneAndUpdate
      // We use { new: true } to return the updated document
      return await User.findOneAndUpdate(identifier, updateData, { new: true });
    } else {
      // Prisma update
      // Prisma requires a unique selector for .update().
      // If identifier is not unique (like tokens potentially?), we might need findFirst then update.
      
      let where = getPrismaWhere(identifier);
      
      if (!where) {
        // If we don't have a unique identifier in the query (e.g. finding by token), 
        // we first find the user to get their ID.
        const user = await prisma.user.findFirst({ where: identifier });
        if (!user) return null;
        where = { id: user.id };
      }

      return await prisma.user.update({
        where,
        data: updateData
      });
    }
  }
};
