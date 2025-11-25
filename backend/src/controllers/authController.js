export const completeProfile = async (req, res) => {
  try {
    const { name, phone, education, skills, teamwork, motivation } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update user basic info
    if (name) user.name = name
    if (phone) user.phone = phone
    await user.save()

    // Update or create volunteer profile
    let volunteer = await Volunteer.findOne({ where: { userId: user.id } })
    
    if (!volunteer) {
      // Create new volunteer profile
      volunteer = await Volunteer.create({
        userId: user.id,
        education: education || 'undergraduate',
        skills: skills || '',
        teamwork: teamwork || false,
        motivation: motivation || '',
        notificationsEnabled: true
      })
    } else {
      // Update existing volunteer profile
      await volunteer.update({
        education: education || volunteer.education,
        skills: skills !== undefined ? skills : volunteer.skills,
        teamwork: teamwork !== undefined ? teamwork : volunteer.teamwork,
        motivation: motivation !== undefined ? motivation : volunteer.motivation
      })
    }

    // Return updated user with volunteer profile
    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Volunteer, as: 'volunteer' },
        { model: Organization, as: 'organization' }
      ],
      attributes: { exclude: ['password'] }
    })

    res.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        volunteer: updatedUser.volunteer,
        organization: updatedUser.organization
      }
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    res.status(500).json({ message: 'Failed to complete profile', error: error.message })
  }
}
