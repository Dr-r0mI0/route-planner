/**
 * Communities Service
 * Handles business logic for community management
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

function readCommunities() {
  const filePath = path.join(DATA_DIR, 'communities.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeCommunities(communities) {
  const filePath = path.join(DATA_DIR, 'communities.json');
  fs.writeFileSync(filePath, JSON.stringify(communities, null, 2));
}

// Get all communities
export function getAllCommunities(profession = null) {
  const communities = readCommunities();
  if (profession) {
    return communities.filter(c => 
      c.category.toLowerCase() === profession.toLowerCase() ||
      c.name.toLowerCase().includes(profession.toLowerCase())
    );
  }
  return communities;
}

// Get community by ID
export function getCommunityById(id) {
  const communities = readCommunities();
  return communities.find(c => c.id === id);
}

// Create new community
export function createCommunity(data) {
  const communities = readCommunities();
  
  const newCommunity = {
    id: Date.now().toString(),
    name: data.name,
    category: data.category,
    description: data.description || '',
    members: data.members || [],
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    createdAt: new Date().toISOString()
  };
  
  communities.push(newCommunity);
  writeCommunities(communities);
  
  return newCommunity;
}

// Join community
export function joinCommunity(communityId, userId) {
  const communities = readCommunities();
  const index = communities.findIndex(c => c.id === communityId);
  
  if (index === -1) {
    return { success: false, error: 'Community not found' };
  }
  
  const community = communities[index];
  
  if (community.members.includes(userId)) {
    return { success: false, error: 'Already a member' };
  }
  
  community.members.push(userId);
  communities[index] = community;
  writeCommunities(communities);
  
  return { success: true, community };
}

// Leave community
export function leaveCommunity(communityId, userId) {
  const communities = readCommunities();
  const index = communities.findIndex(c => c.id === communityId);
  
  if (index === -1) {
    return { success: false, error: 'Community not found' };
  }
  
  const community = communities[index];
  const memberIndex = community.members.indexOf(userId);
  
  if (memberIndex === -1) {
    return { success: false, error: 'Not a member' };
  }
  
  community.members.splice(memberIndex, 1);
  communities[index] = community;
  writeCommunities(communities);
  
  return { success: true, community };
}

// Get messages for community
export function getCommunityMessages(communityId, limit = 50) {
  const filePath = path.join(DATA_DIR, `messages_${communityId}.json`);
  
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  const messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return messages.slice(-limit);
}

// Add message to community
export function addCommunityMessage(communityId, senderId, senderName, content) {
  const filePath = path.join(DATA_DIR, `messages_${communityId}.json`);
  let messages = [];
  
  if (fs.existsSync(filePath)) {
    messages = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  
  const newMessage = {
    id: Date.now().toString(),
    communityId,
    senderId,
    senderName,
    content,
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  
  // Keep only last 100 messages
  if (messages.length > 100) {
    messages = messages.slice(-100);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  
  return newMessage;
}

export default {
  getAllCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
  addCommunityMessage
};