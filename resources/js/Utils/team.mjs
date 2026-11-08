export const memberSkills = (value) => String(value || '').split(',').map(skill => skill.trim()).filter(Boolean);

export function filterMembers(members, division = 'all', query = '') {
    const search = query.trim().toLocaleLowerCase('id');
    return (Array.isArray(members) ? members : []).filter(member =>
        (division === 'all' || member.division === division) &&
        [member.name, member.role, member.division, member.skills].filter(Boolean).join(' ').toLocaleLowerCase('id').includes(search)
    );
}

export function memberForm(member = {}) {
    return {
        name: member.name ?? '', role: member.role ?? '', division: member.division ?? '',
        bio: member.bio ?? '', skills: member.skills ?? '', sort_order: member.sort_order ?? 0,
        is_active: member.is_active === undefined ? true : [true, 1, '1'].includes(member.is_active),
        photo: null,
    };
}
