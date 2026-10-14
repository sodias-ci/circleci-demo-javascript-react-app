import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from '../App';
import posts from '../data/posts.json';

afterEach(cleanup);

const commentsFor = (title: string) => screen.getByRole('region', { name: `Comments on ${title}` });

const addComment = (title: string, text: string) => {
  const section = commentsFor(title);
  const input = within(section).getByLabelText(`Add a comment on ${title}`);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(within(section).getByRole('button', { name: 'Post' }));
};

it('renders a labelled comment input and submit button for every photo', () => {
  render(<App />);
  for (const post of posts) {
    const section = commentsFor(post.title);
    expect(within(section).getByLabelText(`Add a comment on ${post.title}`)).toBeTruthy();
    expect(within(section).getByRole('button', { name: 'Post' })).toBeTruthy();
  }
});

it('shows submitted comments under the photo in the order added', () => {
  render(<App />);
  const { title } = posts[0];
  addComment(title, 'So cute!');
  addComment(title, 'Look at those ears');
  const items = within(commentsFor(title)).getAllByRole('listitem');
  expect(items.map((li) => li.textContent)).toEqual(['So cute!', 'Look at those ears']);
});

it('keeps comments on the photo they were added to', () => {
  render(<App />);
  addComment(posts[0].title, 'First photo comment');
  for (const post of posts.slice(1)) {
    expect(within(commentsFor(post.title)).queryAllByRole('listitem')).toHaveLength(0);
  }
  expect(screen.getAllByText('First photo comment')).toHaveLength(1);
});

it('clears the input after a successful submit', () => {
  render(<App />);
  const { title } = posts[0];
  addComment(title, 'Hello hippo');
  const input = within(commentsFor(title)).getByLabelText(`Add a comment on ${title}`);
  expect((input as HTMLInputElement).value).toBe('');
});

it('submits the comment form without the button (Enter key)', () => {
  render(<App />);
  const { title } = posts[0];
  const input = within(commentsFor(title)).getByLabelText(`Add a comment on ${title}`);
  fireEvent.change(input, { target: { value: 'Submitted with Enter' } });
  fireEvent.submit(input.closest('form')!);
  expect(within(commentsFor(title)).getByText('Submitted with Enter')).toBeTruthy();
});

it('ignores blank comments', () => {
  render(<App />);
  const { title } = posts[0];
  addComment(title, '   ');
  expect(within(commentsFor(title)).queryAllByRole('listitem')).toHaveLength(0);
});

it('keeps the heart toggle working alongside comments', () => {
  render(<App />);
  const { title } = posts[0];
  addComment(title, 'Still likeable');
  const likeButton = screen.getByRole('img', { name: title }).closest('button')!;
  fireEvent.click(likeButton);
  expect(likeButton.getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByLabelText('Liked')).toBeTruthy();
});
