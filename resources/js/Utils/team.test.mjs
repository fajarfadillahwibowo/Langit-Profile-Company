import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMembers, memberSkills, memberForm } from './team.mjs';
import * as team from './team.mjs';

test('public hierarchy recognizes role labels without changing stored profiles', () => {
    assert.equal(typeof team.memberTier, 'function');
    for (const role of ['Founder', 'Co-Founder / Creative Director', 'Pendiri']) assert.equal(team.memberTier({ role }), 'founder');
    for (const role of ['Karyawan', 'Staff Designer', 'Photographer', null]) assert.equal(team.memberTier({ role }), 'staff');
    for (const role of ['Internship', 'Intership', 'Magang Web Developer', 'Freelancer', 'Freelance Designer']) assert.equal(team.memberTier({ role }), 'collaborator');
    assert.equal(team.memberTier({ role: 'Internal Operations' }), 'staff');
});

test('hierarchy groups preserve administrator ordering and all filtered members', () => {
    assert.equal(typeof team.groupMembersByTier, 'function');
    const members = [{ id: 4, role: 'Internship' }, { id: 2, role: 'Founder' }, { id: 3, role: 'Designer' }, { id: 1, role: 'Co-Founder' }];
    const before = JSON.stringify(members);
    assert.deepEqual(team.groupMembersByTier(members).map(g => [g.id, g.members.map(m => m.id)]), [
        ['founder', [2, 1]], ['staff', [3]], ['collaborator', [4]],
    ]);
    assert.equal(JSON.stringify(members), before);
    assert.deepEqual(team.groupMembersByTier([]), []);
});

test('division and case-insensitive search combine without mutating the supplied order', () => {
    const members = [{ id: 1, name: 'Test Alpha', role: 'Designer', division: 'Visual', skills: 'Brand, Foto' }, { id: 2, name: 'Test Beta', role: 'Developer', division: 'Web' }];
    assert.deepEqual(filterMembers(members, 'Visual', ' FOTO ').map(m => m.id), [1]);
    assert.deepEqual(filterMembers(members, 'Web', 'alpha'), []);
    assert.deepEqual(filterMembers(members, 'all', '').map(m => m.id), [1, 2]);
    assert.deepEqual(filterMembers(null, 'all', ''), []);
});

test('skills trim empty tokens and handle absent biographies safely', () => {
    assert.deepEqual(memberSkills(' Foto, , Web ,'), ['Foto', 'Web']);
    assert.deepEqual(memberSkills(null), []);
});

test('edit form preserves explicitly inactive values and never resubmits an existing photo URL', () => {
    for (const value of [false, 0, '0']) assert.equal(memberForm({ is_active: value }).is_active, false);
    for (const value of [true, 1, '1']) assert.equal(memberForm({ is_active: value }).is_active, true);
    assert.equal(memberForm().is_active, true);
    assert.equal(memberForm({ photo_url: '/storage/team.jpg' }).photo, null);
    assert.equal(memberForm({ sort_order: 0 }).sort_order, 0);
    assert.equal(memberForm({ skills: 'Foto, Web' }).skills, 'Foto, Web');
});
