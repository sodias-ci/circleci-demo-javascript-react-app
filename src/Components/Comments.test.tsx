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

it("submits via the form's submit event", () => {
  render(<App />);
  const { title } = posts[0];
  const input = within(commentsFor(title)).getByLabelText(`Add a comment on ${title}`);
  fireEvent.change(input, { target: { value: 'Submitted via form' } });
  fireEvent.submit(input.closest('form')!);
  expect(within(commentsFor(title)).getByText('Submitted via form')).toBeTruthy();
});

it('disables Post and ignores blank comments', () => {
  render(<App />);
  const { title } = posts[0];
  const section = commentsFor(title);
  const input = within(section).getByLabelText(`Add a comment on ${title}`);
  const button = within(section).getByRole('button', { name: 'Post' }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  fireEvent.change(input, { target: { value: '   ' } });
  expect(button.disabled).toBe(true);
  fireEvent.submit(input.closest('form')!);
  expect(within(section).queryAllByRole('listitem')).toHaveLength(0);
});

it('limits comment length', () => {
  render(<App />);
  const { title } = posts[0];
  const input = within(commentsFor(title)).getByLabelText(`Add a comment on ${title}`);
  expect(input.getAttribute('maxlength')).toBe('280');
});

it('announces new comments through a polite live region', () => {
  render(<App />);
  const { title } = posts[0];
  const list = within(commentsFor(title)).getByRole('list');
  expect(list.getAttribute('aria-live')).toBe('polite');
  addComment(title, 'Announced');
  expect(within(commentsFor(title)).getByRole('list')).toBe(list);
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
