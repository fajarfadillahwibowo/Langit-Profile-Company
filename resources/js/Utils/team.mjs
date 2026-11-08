export const memberSkills = (value) => String(value || '').split(',').map(skill => skill.trim()).filter(Boolean);

export function filterMembers(members, division = 'all', query = '') {
    const search = query.trim().toLocaleLowerCase('id');
    return (Array.isArray(members) ? members : []).filter(member =>
        (division === 'all' || member.division === division) &&
        [member.name, member.role, member.division, member.skills].filter(Boolean).join(' ').toLocaleLowerCase('id').includes(search)
    );
}

export function memberTier(member = {}) {
    const role = String(member.role || '').toLocaleLowerCase('id');
    if (/\b(founder|pendiri)\b/.test(role)) return 'founder';
    if (/\b(intern|internship|intership|magang|freelance|freelancer)\b/.test(role)) return 'collaborator';
    return 'staff';
}

export function groupMembersByTier(members) {
    return ['founder', 'staff', 'collaborator'].map(id => ({
        id,
        members: (Array.isArray(members) ? members : []).filter(member => memberTier(member) === id),
    })).filter(group => group.members.length > 0);
}

export function memberForm(member = {}) {
    return {
        name: member.name ?? '', role: member.role ?? '', division: member.division ?? '',
        bio: member.bio ?? '', skills: member.skills ?? '', sort_order: member.sort_order ?? 0,
        is_active: member.is_active === undefined ? true : [true, 1, '1'].includes(member.is_active),
        photo: null,
    };
}
