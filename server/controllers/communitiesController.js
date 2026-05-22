/**
 * Communities Controller
 * Handles HTTP requests for community operations
 */

import {
  getAllCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
  addCommunityMessage
} from '../services/communitiesService.js';

// GET /api/communities
export async function getCommunities(req, res) {
  try {
    const { profession } = req.query;
    const communities = getAllCommunities(profession);
    
    res.json({
      success: true,
      data: communities
    });
  } catch (error) {
    console.error('Error getting communities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch communities'
    });
  }
}

// POST /api/communities
export async function createNewCommunity(req, res) {
  try {
    const { name, category, description, isPublic } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name and category are required'
      });
    }
    
    const community = createCommunity({
      name,
      category,
      description,
      isPublic
    });
    
    res.status(201).json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create community'
    });
  }
}

// GET /api/communities/:id
export async function getCommunity(req, res) {
  try {
    const { id } = req.params;
    const community = getCommunityById(id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }
    
    res.json({
      success: true,
      data: community
    });
  } catch (error) {
    console.error('Error getting community:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch community'
    });
  }
}

// POST /api/communities/:id/join
export async function joinExistingCommunity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const result = joinCommunity(id, userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      message: 'Successfully joined community',
      data: result.community
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join community'
    });
  }
}

// POST /api/communities/:id/leave
export async function leaveExistingCommunity(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const result = leaveCommunity(id, userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json({
      success: true,
      message: 'Successfully left community',
      data: result.community
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave community'
    });
  }
}

// GET /api/communities/:id/messages
export async function getMessages(req, res) {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    
    const messages = getCommunityMessages(id, limit ? parseInt(limit) : 50);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
}

// POST /api/communities/:id/messages
export async function postMessage(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;
    const userName = req.user?.name || 'Anonymous';
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }
    
    const message = addCommunityMessage(id, userId, userName, content.trim());
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to post message'
    });
  }
}

export default {
  getCommunities,
  createNewCommunity,
  getCommunity,
  joinExistingCommunity,
  leaveExistingCommunity,
  getMessages,
  postMessage
};